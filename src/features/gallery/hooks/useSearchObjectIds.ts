import { useQuery } from '@tanstack/react-query';
import { fetchSearchObjectIds } from '../api/galleryApi';

/**
 * Fetches the full ID pool for the current Met /search query string.
 * Query key includes the string so filter changes refetch automatically.
 */
export const useSearchObjectIds = (metSearchQueryString: string) => {
  return useQuery({
    queryKey: ['gallery-search', metSearchQueryString],
    queryFn: () => fetchSearchObjectIds(metSearchQueryString),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
};
