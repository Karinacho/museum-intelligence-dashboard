import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGalleryObjectIdList } from '../api/galleryApi';
import type { UrlGalleryFilters } from '../lib/resolveGallerySearch';

/**
 * Single source for gallery ID lists (highlights, search, department browse,
 * department + keyword via search ∩ department IDs).
 */
export const useGalleryObjectIds = (
  state: UrlGalleryFilters,
  /** URL search string without `page` so pagination does not refetch the list. */
  filterKey: string
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['gallery-object-ids', filterKey],
    queryFn: ({ signal }) =>
      fetchGalleryObjectIdList(state, signal, queryClient),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
};
