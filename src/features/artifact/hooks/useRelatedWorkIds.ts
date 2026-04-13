import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MetDepartment } from '@/features/gallery/types';
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

  //whether related-works search is allowed yet, and if not, why 
  const relatedWorksStatus = useMemo(
    () => getRelatedWorksReadiness(detail, departments, departmentsLoading),
    [detail, departments, departmentsLoading]
  );

  const enabled = relatedWorksStatus.status === 'ok';
  const departmentId =
    relatedWorksStatus.status === 'ok' ? relatedWorksStatus.departmentId : null;
  const dateBegin = relatedWorksStatus.status === 'ok' ? relatedWorksStatus.relatedWorksDateBegin : null;
  const dateEnd = relatedWorksStatus.status === 'ok' ? relatedWorksStatus.relatedWorksDateEnd : null;

  const query = useQuery({
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
    retry: 1,
  });

  return { relatedWorksStatus, ...query };
};
