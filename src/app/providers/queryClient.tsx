import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient configuration optimized for Met Museum API
 *
 * Cache strategy:
 * - Object details: 24 hours stale time (museum data rarely changes)
 * - Object IDs list: Infinite cache (static data, fetched once)
 * - Automatic retries: 3 attempts with exponential backoff
 * - Request deduplication: Automatic for parallel queries with same key
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      gcTime: 1000 * 60 * 10, // 10 minutes - keep in memory
      retry: 3, // Retry failed requests 3 times
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when internet reconnects
    },
  },
});
