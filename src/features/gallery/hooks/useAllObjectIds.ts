import { useQuery } from '@tanstack/react-query';
import { fetchAllObjectIds } from '../api/galleryApi';

/**
 * Hook to fetch all object IDs from Met Museum (one-time fetch)
 *
 * This hook fetches ~470K object IDs and caches them indefinitely.
 * The fetch only happens once per session and is stored in memory.
 *
 * Cache strategy:
 * - staleTime: Infinity - Data never becomes stale
 * - gcTime: Infinity - Cache never gets garbage collected
 * - No refetch on window focus or reconnect
 *
 * @returns Query result with all object IDs
 */
export const useAllObjectIds = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['objectIds'],
    queryFn: fetchAllObjectIds,
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
