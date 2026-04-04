import { useQuery } from '@tanstack/react-query';
import { fetchObjectIdsByDepartment } from '../api/galleryApi';

export const useDepartmentObjectIds = (
  departmentId: number | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['department-objects', departmentId],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      fetchObjectIdsByDepartment(departmentId!, signal),
    enabled: (options?.enabled ?? true) && departmentId !== undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
};
