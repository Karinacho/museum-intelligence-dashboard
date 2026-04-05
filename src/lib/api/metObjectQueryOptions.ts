import { ApiError } from '@/lib/api/metMuseumClient';

export const MET_OBJECT_STALE_TIME = Number.POSITIVE_INFINITY;
export const MET_OBJECT_GC_TIME = 1000 * 60 * 30;

const MAX_RETRIES_DEFAULT = 2;
const MAX_RETRIES_RATE_LIMIT = 4;

export function isRateLimitApiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 403 || error.status === 429)
  );
}

/** Extra retries for Met rate limiting; moderate retries for other failures. */
export function metObjectRetry(failureCount: number, error: unknown): boolean {
  if (isRateLimitApiError(error)) {
    return failureCount < MAX_RETRIES_RATE_LIMIT;
  }
  return failureCount < MAX_RETRIES_DEFAULT;
}

export function metObjectRetryDelay(failureIndex: number, error: unknown): number {
  if (isRateLimitApiError(error)) {
    return Math.min(20_000, 3_000 * 2 ** failureIndex);
  }
  return Math.min(8_000, 500 * 2 ** failureIndex);
}

export const metObjectQueryDefaults = {
  staleTime: MET_OBJECT_STALE_TIME,
  gcTime: MET_OBJECT_GC_TIME,
  retry: metObjectRetry,
  retryDelay: metObjectRetryDelay,
} as const;
