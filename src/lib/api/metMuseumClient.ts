const MET_API_DIRECT =
    'https://collectionapi.metmuseum.org/public/collection/v1';
const MET_API_PROXY = '/api/met';

const MET_API_BASE_URL =
    import.meta.env.DEV ? MET_API_PROXY : MET_API_DIRECT;

const MAX_CONCURRENT = 4;
const THROTTLE_MS = 150;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 10_000;

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

    constructor(baseUrl: string = MET_API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private scheduleNext() {
        if (this.queue.length === 0 || this.inflight >= MAX_CONCURRENT) return;

        const entry = this.queue.shift()!;
        if (entry.signal?.aborted) {
            entry.reject(entry.signal.reason ?? new DOMException('Aborted', 'AbortError'));
            this.scheduleNext();
            return;
        }
        this.inflight++;
        setTimeout(entry.resolve, THROTTLE_MS);
    }

    private enqueue(signal?: AbortSignal): Promise<void> {
        if (signal?.aborted) {
            return Promise.reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        }

        if (this.inflight < MAX_CONCURRENT) {
            this.inflight++;
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            const entry: QueueEntry = { resolve, reject, signal };
            this.queue.push(entry);

            signal?.addEventListener('abort', () => {
                const idx = this.queue.indexOf(entry);
                if (idx !== -1) {
                    this.queue.splice(idx, 1);
                    reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
                }
            }, { once: true });
        });
    }

    private release() {
        this.inflight--;
        this.scheduleNext();
    }

    private delay(ms: number, signal?: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, ms);
            signal?.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
            }, { once: true });
        });
    }

    async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
        await this.enqueue(signal);
        const url = `${this.baseUrl}${endpoint}`;

        let lastError: unknown = null;

        try {
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                if (attempt > 0) {
                    const backoff = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
                    await this.delay(backoff, signal);
                }

                try {
                    const response = await fetch(url, { signal });

                    if (response.ok) return await response.json();

                    const apiError = new ApiError(
                        response.status,
                        `Met API error: ${response.status} ${response.statusText}`
                    );

                    if (response.status >= 400 && response.status < 500) throw apiError;

                    lastError = apiError;
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'AbortError') throw error;
                    if (error instanceof ApiError && error.status >= 400 && error.status < 500) throw error;
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