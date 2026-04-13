import { useQuery } from '@tanstack/react-query';
import { fetchObjectById } from '@/features/gallery/api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import { toArtworkDetail, type MetObjectResponse } from '@/lib/models/artwork';

export const useArtifactDetail = (objectId: number | undefined) => {
  const valid = objectId != null && Number.isFinite(objectId) && objectId > 0;
  const id = valid ? objectId : 0;

  return useQuery({
    queryKey: valid
      ? metObjectQueryKey(id)
      : (['met-object', 'invalid'] as const),
    queryFn: () => fetchObjectById(id),
    select: (raw: MetObjectResponse) => toArtworkDetail(raw),
    enabled: valid,
    staleTime: Number.POSITIVE_INFINITY,
    // gcTime: 1000 * 60 * 30,
    retry: 1,
  });
};
