import { useQuery } from '@tanstack/react-query';
import { fetchDepartments } from '../api/galleryApi';

export const useDepartments = () => {
  return useQuery({
    queryKey: ['met-departments'],
    queryFn: fetchDepartments,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });
};
