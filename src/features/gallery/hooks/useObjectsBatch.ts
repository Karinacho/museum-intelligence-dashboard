import { useQueries } from '@tanstack/react-query';
import { fetchObjectById } from '../api/galleryApi';
import { toArtworkCard, ArtworkCard } from '@/lib/models/artwork';

/**
 * Hook to fetch multiple objects by their IDs with optimized parallel fetching
 *
 * This hook uses TanStack Query's useQueries to:
 * - Fetch multiple objects in parallel (with built-in request deduplication)
 * - Cache individual objects for 1 hour
 * - Handle errors gracefully (failed fetches return null)
 * - Prevent duplicate requests for same ID
 *
 * @param ids - Array of object IDs to fetch (typically 20 for one page)
 * @returns Array of query results with loading states and data
 */
export const useObjectsBatch = (ids: number[] = []) => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['object', id],
      queryFn: async () => {
        try {
          const response = await fetchObjectById(id);
          return toArtworkCard(response);
        } catch (error) {
          console.warn(`Failed to fetch object ${id}:`, error);
          return null;
        }
      },
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
    })),
  });
};

/**
 * Helper hook that combines useObjectsBatch with data extraction
 *
 * @param ids - Array of object IDs to fetch
 * @returns Object with loading state, error state, and successfully fetched artworks
 */
export const useArtworks = (ids: number[] = []) => {
  const queries = useObjectsBatch(ids);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  // Extract successfully fetched artworks (filter out nulls and errors)
  const artworks = queries
    .map((q) => q.data)
    .filter((artwork): artwork is ArtworkCard => artwork !== null);

  return {
    artworks,
    isLoading,
    isError,
    // Individual query states for skeleton loading
    queryStates: queries.map((q) => ({
      isLoading: q.isLoading,
      isError: q.isError,
      data: q.data,
    })),
  };
};
