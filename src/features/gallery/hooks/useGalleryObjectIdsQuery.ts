import { useQuery } from '@tanstack/react-query';
import { fetchGalleryObjectIdList } from '../api/galleryApi';
import { galleryObjectIdsQueryKey } from '../lib/resolveGallerySearch';
import type { UrlGalleryFilters } from '../types';

/**
 * Met `/search` ID list for the current filters.
 */
export const useGalleryObjectIdsQuery = (currentFilters: UrlGalleryFilters) => {
  return useQuery<number[], Error>({
    queryKey: galleryObjectIdsQueryKey(currentFilters),
    queryFn: ({ signal }) => fetchGalleryObjectIdList(currentFilters, signal),
  });
};
