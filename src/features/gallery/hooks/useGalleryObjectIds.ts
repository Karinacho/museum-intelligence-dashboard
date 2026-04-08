import { useQuery } from '@tanstack/react-query';
import { fetchGalleryObjectIdList } from '../api/galleryApi';
import {
  galleryObjectIdsQueryKey,
  type UrlGalleryFilters,
} from '../lib/resolveGallerySearch';

/**
 * Met `/search` or `/objects` ID list for the current filters (5 min stale).
 * `placeholderData: keepPreviousData` keeps the grid populated while filters change.
 */
export const useGalleryObjectIds = (state: UrlGalleryFilters) => {
  return useQuery<number[], Error>({
    queryKey: galleryObjectIdsQueryKey(state),
    queryFn: ({ signal }) => fetchGalleryObjectIdList(state, signal),
    refetchOnWindowFocus: false,
  });
};
