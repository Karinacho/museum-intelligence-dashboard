import { fetchObjectById } from '../api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import { metObjectQueryDefaults } from '@/lib/api/metObjectQueryOptions';
import { transformArtwork, type MetObjectResponse } from '@/lib/models/artwork';

export const galleryArtworkQueryOptions = (id: number) =>
  ({
    queryKey: metObjectQueryKey(id),
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchObjectById(id, signal),
    select: (raw: MetObjectResponse) => ({
      raw,
      artwork: transformArtwork(raw),
    }),
    ...metObjectQueryDefaults,
  }) as const;
