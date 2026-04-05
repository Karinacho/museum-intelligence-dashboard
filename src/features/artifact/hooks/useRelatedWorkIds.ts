import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type MetDepartment } from '@/features/gallery/api/galleryApi';
import type { ArtworkDetail } from '@/lib/models/artwork';
import {
  fetchRelatedWorkIdsStrict,
  getRelatedWorksReadiness,
  MAX_RELATED_IDS_TO_FETCH,
} from '../lib/relatedWorks';

type Args = {
  artifactId: number;
  detail: ArtworkDetail | null | undefined;
  departments: MetDepartment[] | undefined;
  departmentsLoading: boolean;
};

export const useRelatedWorkIds = ({
  artifactId,
  detail,
  departments,
  departmentsLoading,
}: Args) => {
  const readiness = useMemo(
    () =>
      getRelatedWorksReadiness(detail, departments, departmentsLoading),
    [detail, departments, departmentsLoading]
  );

  const enabled = readiness.status === 'ok';
  const departmentId =
    readiness.status === 'ok' ? readiness.departmentId : null;
  const dateBegin = readiness.status === 'ok' ? readiness.dateBegin : null;
  const dateEnd = readiness.status === 'ok' ? readiness.dateEnd : null;

  return useQuery({
    queryKey: [
      'related-work-ids',
      artifactId,
      departmentId,
      dateBegin,
      dateEnd,
    ],
    queryFn: ({ queryKey, signal }) => {
      const [, id, dept, dBegin, dEnd] = queryKey;
      if (
        typeof id !== 'number' ||
        typeof dept !== 'number' ||
        typeof dBegin !== 'number' ||
        typeof dEnd !== 'number'
      ) {
        return Promise.resolve([]);
      }
      return fetchRelatedWorkIdsStrict(
        dept,
        dBegin,
        dEnd,
        id,
        MAX_RELATED_IDS_TO_FETCH,
        signal
      );
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
