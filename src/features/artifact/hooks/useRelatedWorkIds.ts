import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchSearchObjectIds,
  type MetDepartment,
} from '@/features/gallery/api/galleryApi';
import type { ArtworkDetail } from '@/lib/models/artwork';
import {
  buildRelatedWorksSearchQueryString,
  getRelatedWorksReadiness,
  MAX_RELATED_IDS_TO_FETCH,
  takeRelatedIdsExcluding,
} from '../lib/relatedWorks';

type Args = {
  artifactId: number;
  detail: ArtworkDetail | null | undefined;
  departments: MetDepartment[] | undefined;
};

export const useRelatedWorkIds = ({
  artifactId,
  detail,
  departments,
}: Args) => {
  const readiness = useMemo(
    () => getRelatedWorksReadiness(detail, departments),
    [detail, departments]
  );

  const queryString = useMemo(() => {
    if (readiness.status !== 'ok') return null;
    return buildRelatedWorksSearchQueryString(
      readiness.departmentId,
      readiness.dateBegin,
      readiness.dateEnd
    );
  }, [readiness]);

  const enabled = readiness.status === 'ok' && queryString != null;

  return useQuery({
    queryKey: [
      'related-work-ids',
      artifactId,
      readiness.status === 'ok'
        ? readiness.departmentId
        : null,
      readiness.status === 'ok' ? readiness.dateBegin : null,
      readiness.status === 'ok' ? readiness.dateEnd : null,
    ],
    queryFn: () => fetchSearchObjectIds(queryString!),
    select: (ids: number[]) =>
      takeRelatedIdsExcluding(ids, artifactId, MAX_RELATED_IDS_TO_FETCH),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
