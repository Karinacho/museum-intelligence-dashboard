import { useQuery } from '@tanstack/react-query';
import { fetchGalleryObjectIdList } from '../api/galleryApi';
import {
  galleryObjectIdsQueryKey,
  type UrlGalleryFilters,
} from '../lib/resolveGallerySearch';

/**
 * Met `/search` or `/objects` ID list for the current filters (5 min stale).
 * Query key is a normalized filter object so it stays stable and debuggable.
 */
export const useGalleryObjectIds = (state: UrlGalleryFilters) => {
  return useQuery({
    queryKey: galleryObjectIdsQueryKey(state),
    queryFn: ({ signal }) => fetchGalleryObjectIdList(state, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
