import { memo, useEffect, useMemo, useRef } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Card, CardSkeleton } from '@/components/ui';
import Grid from '@/components/layout/Grid/Grid.tsx';
import { fetchObjectById } from '../../api/galleryApi.ts';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey.ts';
import { GALLERY_PAGE_SIZE } from '../../lib/constants.ts';
import {
  isRateLimitApiError,
  metObjectQueryDefaults,
} from '@/lib/api/metObjectQueryOptions.ts';
import {
  transformArtwork,
  type MetObjectResponse,
} from '@/lib/models/artwork.ts';
import styles from './PaginatedArtworkGrid.module.css';

type PaginatedArtworkGridProps = {
  objectIds: number[];
  page: number;
  onPageChange: (page: number) => void;
  /** True while the object-ID list query is pending and empty — show skeleton grid only. */
  idsLoading?: boolean;
};

type PageQueryData = {
  raw: MetObjectResponse;
  artwork: ReturnType<typeof transformArtwork>;
};

function GalleryObjectErrorSlot({
  id,
  query,
}: {
  id: number;
  query: UseQueryResult<PageQueryData, Error>;
}) {
  const rateLimited = isRateLimitApiError(query.error);
  return (
    <div className={styles.errorSlot}>
      <p className={styles.errorText}>
        {rateLimited
          ? 'The API is limiting requests. Wait a moment or retry.'
          : 'Could not load this artwork.'}
      </p>
      <button
        type="button"
        className={styles.retryBtn}
        onClick={() => query.refetch()}
      >
        Retry
      </button>
      <span className={styles.errorMeta}>ID {id}</span>
    </div>
  );
}

const metObjectQueryOptions = (id: number) =>
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

const GalleryArtworkSlot = memo(function GalleryArtworkSlot({
  id,
  galleryLocation,
}: {
  id: number;
  galleryLocation: string;
}) {
  const q = useQuery<MetObjectResponse, Error, PageQueryData>({
    ...metObjectQueryOptions(id),
  });

  if (q.isError) {
    return (
      <div>
        <GalleryObjectErrorSlot id={id} query={q} />
      </div>
    );
  }
  if (q.isPending) {
    return (
      <div>
        <CardSkeleton />
      </div>
    );
  }
  if (!q.data?.artwork) {
    return (
      <div>
        <CardSkeleton />
      </div>
    );
  }
  const a = q.data.artwork;
  return (
    <div>
      <Card
        to={`/artifact/${a.id}`}
        state={{ from: galleryLocation }}
        name={a.title}
        artist={a.artist}
        objectDate={a.dateLine}
        imageSrc={a.imageUrl}
      />
    </div>
  );
});

const PaginatedArtworkGrid = ({
  objectIds,
  page,
  onPageChange,
  idsLoading = false,
}: PaginatedArtworkGridProps) => {
  const location = useLocation();
  const galleryLocation = `${location.pathname}${location.search}`;
  const totalPages = Math.max(
    1,
    Math.ceil(objectIds.length / GALLERY_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageIds = useMemo(() => {
    const start = (safePage - 1) * GALLERY_PAGE_SIZE;
    return objectIds.slice(start, start + GALLERY_PAGE_SIZE);
  }, [objectIds, safePage]);

  const queryClient = useQueryClient();

  const queriesForBanner = useQueries({
    queries:
      idsLoading || pageIds.length === 0
        ? []
        : pageIds.map((id) => ({ ...metObjectQueryOptions(id) })),
  });

  const showRateBanner = useMemo(
    () =>
      queriesForBanner.some((q) => q.isError && isRateLimitApiError(q.error)),
    [queriesForBanner]
  );

  const hasNextPage = safePage < totalPages;

  const nextPageIds = useMemo(() => {
    if (!hasNextPage) return [];
    const start = safePage * GALLERY_PAGE_SIZE;
    return objectIds.slice(start, start + GALLERY_PAGE_SIZE);
  }, [objectIds, safePage, hasNextPage]);

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
        void queryClient.prefetchQuery({ ...metObjectQueryOptions(id) });
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

  if (idsLoading) {
    return (
      <div className={styles.wrap}>
        <Grid>
          {Array.from({ length: GALLERY_PAGE_SIZE }, (_, i) => (
            <div key={`ids-loading-${i}`}>
              <CardSkeleton />
            </div>
          ))}
        </Grid>
        <nav className={styles.pagination} aria-label="Gallery pages">
          <div className={styles.controls}>
            <button type="button" className={styles.navBtn} disabled>
              Previous
            </button>
            <span className={styles.pageStatus}>Page 1</span>
            <button type="button" className={styles.navBtn} disabled>
              Next
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {showRateBanner ? (
        <div className={styles.rateBanner} role="status">
          The Metropolitan Museum API is rate limiting. Requests are spaced and
          will retry automatically; use Retry on a card if it stays stuck.
        </div>
      ) : null}
      <Grid>
        {pageIds.map((id) => (
          <GalleryArtworkSlot
            key={id}
            id={id}
            galleryLocation={galleryLocation}
          />
        ))}
      </Grid>

      <nav className={styles.pagination} aria-label="Gallery pages">
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navBtn}
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            Previous
          </button>
          <span className={styles.pageStatus}>Page {safePage}</span>
          <button
            type="button"
            className={styles.navBtn}
            disabled={!hasNextPage}
            onClick={() => onPageChange(safePage + 1)}
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  );
};

export default PaginatedArtworkGrid;
