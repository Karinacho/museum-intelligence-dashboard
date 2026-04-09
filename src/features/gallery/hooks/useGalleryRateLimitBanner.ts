import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { isRateLimitApiError } from '@/lib/api/metObjectQueryOptions';
import { galleryArtworkQueryOptions } from '../lib/galleryArtworkQueryOptions';

/**
 * Mirrors the current page’s artwork queries so we can show a banner when any
 * slot hits a rate-limit error (without coupling to individual slot components).
 */
export function useGalleryRateLimitBanner(
  pageIds: number[],
  idsLoading: boolean
) {
  const queriesForBanner = useQueries({
    queries:
      idsLoading || pageIds.length === 0
        ? []
        : pageIds.map((id) => ({ ...galleryArtworkQueryOptions(id) })),
  });

  return useMemo(
    () =>
      queriesForBanner.some((q) => q.isError && isRateLimitApiError(q.error)),
    [queriesForBanner]
  );
}
