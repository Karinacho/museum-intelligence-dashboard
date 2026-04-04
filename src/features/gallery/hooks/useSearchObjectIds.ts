import { useQuery } from '@tanstack/react-query';
import { fetchSearchObjectIds } from '../api/galleryApi';
import { type GalleryFilters, DEFAULT_GALLERY_FILTERS } from '../types/filters';

/**
 * Hook to fetch object IDs based on search filters
 *
 * Default behavior (no filters):
 * - Fetches "Highlights" collection (~2K objects)
 * - All have images (better UX)
 * - Curated, high-quality subset
 *
 * With filters:
 * - Fetches based on department, date range, keyword
 * - Results cached for 5 minutes
 * - Instant refetch when filters change
 *
 * @param filters - Gallery filter configuration
 * @returns Query result with filtered object IDs
 */
export const useSearchObjectIds = (
  filters: GalleryFilters = DEFAULT_GALLERY_FILTERS
) => {
  return useQuery({
    queryKey: ['search', 'objects', filters],
    queryFn: () => fetchSearchObjectIds(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes - searches can be refetched
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
