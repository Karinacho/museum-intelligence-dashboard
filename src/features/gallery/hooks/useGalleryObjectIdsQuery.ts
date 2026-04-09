import { useQuery } from '@tanstack/react-query';
import { fetchGalleryObjectIdList } from '../api/galleryApi';
import {
  galleryObjectIdsQueryKey,
  type UrlGalleryFilters,
} from '../lib/resolveGallerySearch';

/**
 * Met `/search` or `/objects` ID list for the current filters.
 * `placeholderData: keepPreviousData` keeps the grid populated while filters change.
 */
export const useGalleryObjectIdsQuery = (currentFilters: UrlGalleryFilters) => {
  return useQuery<number[], Error>({
    queryKey: galleryObjectIdsQueryKey(currentFilters),
    queryFn: ({ signal }) => fetchGalleryObjectIdList(currentFilters, signal)
  });
};
