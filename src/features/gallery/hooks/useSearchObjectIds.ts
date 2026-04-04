import { useQuery } from '@tanstack/react-query';
import { fetchSearchObjectIds } from '../api/galleryApi';

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
