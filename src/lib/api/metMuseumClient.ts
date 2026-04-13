/** Same-origin path; dev server (Vite) and Netlify rewrite proxy to collectionapi.metmuseum.org. */
const MET_API_BASE_URL = '/api/met';

/** Balance throughput vs Met 403/429; lower if you see frequent rate-limit banners. */
const MAX_CONCURRENT = 5;
/** Minimum gap between request starts (serial pacing); lower = faster bursts (e.g. related-works scans). */
const THROTTLE_MS = 120;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 15_000;
const RATE_LIMIT_COOLDOWN_MS = 15_000;

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type QueueEntry = {
  resolve: () => void;
  reject: (reason: unknown) => void;
  signal?: AbortSignal;
};

class MetMuseumClient {
  private readonly baseUrl: string;
  private inflight = 0;
  private queue: QueueEntry[] = [];
  private rateLimitedUntil = 0;
  private lastFetchStart = 0;
  private paceChain: Promise<void> = Promise.resolve();

  constructor(baseUrl: string = MET_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private scheduleNext() {
    if (this.queue.length === 0 || this.inflight >= MAX_CONCURRENT) return;

    const entry = this.queue.shift()!;
    if (entry.signal?.aborted) {
      entry.reject(
        entry.signal.reason ?? new DOMException('Aborted', 'AbortError')
      );
      this.scheduleNext();
      return;
    }
    this.inflight++;
    queueMicrotask(() => entry.resolve());
  }

  private enqueue(signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) {
      return Promise.reject(
        signal.reason ?? new DOMException('Aborted', 'AbortError')
      );
    }

    if (this.inflight < MAX_CONCURRENT) {
      this.inflight++;
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const entry: QueueEntry = { resolve, reject, signal };
      this.queue.push(entry);

      signal?.addEventListener(
        'abort',
        () => {
          const idx = this.queue.indexOf(entry);
          if (idx !== -1) {
            this.queue.splice(idx, 1);
            reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
          }
        },
        { once: true }
      );
    });
  }

  private release() {
    this.inflight--;
    this.scheduleNext();
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        },
        { once: true }
      );
    });
  }

  private isNonRetryableClientError(status: number): boolean {
    return status >= 400 && status < 500 && status !== 403 && status !== 429;
  }

  /** Minimum spacing between request starts (global), plus Met cooldown window. */
  private paceBeforeFetch(signal?: AbortSignal): Promise<void> {
    const run = async () => {
      const now = Date.now();
      const cooldownRemaining = Math.max(0, this.rateLimitedUntil - now);
      const throttleWait = Math.max(
        0,
        THROTTLE_MS - (now - this.lastFetchStart)
      );
      const wait = Math.max(cooldownRemaining, throttleWait);
      if (wait > 0) await this.delay(wait, signal);
      this.lastFetchStart = Date.now();
    };
    const next = this.paceChain.then(run);
    this.paceChain = next.catch(() => {});
    return next;
  }

  async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    await this.enqueue(signal);
    await this.paceBeforeFetch(signal);
    const url = `${this.baseUrl}${endpoint}`;

    let lastError: unknown = null;

    try {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const cooldownRemaining = Math.max(
            0,
            this.rateLimitedUntil - Date.now()
          );
          const backoff = Math.max(
            Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS),
            cooldownRemaining
          );
          await this.delay(backoff, signal);
        }

        try {
          const response = await fetch(url, { signal });

          if (response.ok) return await response.json();

          const apiError = new ApiError(
            response.status,
            `Met API error: ${response.status} ${response.statusText}`
          );

          if (response.status === 403 || response.status === 429) {
            this.rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
            lastError = apiError;
            continue;
          }

          if (this.isNonRetryableClientError(response.status)) throw apiError;

          lastError = apiError;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError')
            throw error;
          if (
            error instanceof ApiError &&
            this.isNonRetryableClientError(error.status)
          )
            throw error;
          lastError = error;
        }
      }

      throw lastError;
    } finally {
      this.release();
    }
  }
}

export const metClient = new MetMuseumClient();
