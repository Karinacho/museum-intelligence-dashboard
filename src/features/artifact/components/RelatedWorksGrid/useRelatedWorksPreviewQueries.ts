import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { fetchObjectById } from '@/features/gallery/api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import { metObjectQueryDefaults } from '@/lib/api/metObjectQueryOptions';
import { transformArtwork, type MetObjectResponse } from '@/lib/models/artwork';

export function useRelatedWorksPreviewQueries(ids: number[]) {
  const location = useLocation();
  const artifactLocation = `${location.pathname}${location.search}`;

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: metObjectQueryKey(id),
      queryFn: ({ signal }) => fetchObjectById(id, signal),
      select: (raw: MetObjectResponse) => transformArtwork(raw),
      ...metObjectQueryDefaults,
    })),
  });

  const loadCounts = useMemo(() => {
    if (ids.length === 0 || queries.length !== ids.length) return null;
    let ready = 0;
    for (const q of queries) {
      if (q && !q.isPending) ready += 1;
    }
    return { ready, total: ids.length };
  }, [ids.length, queries]);

  return { queries, loadCounts, artifactLocation };
}
