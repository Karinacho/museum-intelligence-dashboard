import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { galleryArtworkQueryOptions } from '../lib/galleryArtworkQueryOptions';

export function usePrefetchGalleryNextPage(
  nextPageIds: number[],
  idsLoading: boolean
) {
  const queryClient = useQueryClient();
  const prefetchDoneKey = useRef<string>('');

  useEffect(() => {
    if (idsLoading || nextPageIds.length === 0) return;

    const key = nextPageIds.join(',');
    let cancelled = false;
    let idleId: number;

    const run = () => {
      if (cancelled) return;
      if (prefetchDoneKey.current === key) return;
      prefetchDoneKey.current = key;
      for (const id of nextPageIds) {
        void queryClient.prefetchQuery({ ...galleryArtworkQueryOptions(id) });
      }
    };

    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(run, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(run, 400) as unknown as number;
    }

    return () => {
      cancelled = true;
      if (typeof requestIdleCallback !== 'undefined') {
        cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [idsLoading, nextPageIds, queryClient]);
}
