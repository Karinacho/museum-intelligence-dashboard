import { useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Card, CardSkeleton } from '@/components/ui';
import Grid from '@/components/layout/Grid/Grid';
import { fetchObjectById } from '../api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import {
  isRateLimitApiError,
  metObjectQueryDefaults,
} from '@/lib/api/metObjectQueryOptions';
import { transformArtwork, type MetObjectResponse } from '@/lib/models/artwork';
import styles from './PaginatedArtworkGrid.module.css';

export const GALLERY_PAGE_SIZE = 20;

type PaginatedArtworkGridProps = {
  objectIds: number[];
  page: number;
  onPageChange: (page: number) => void;
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

type IdleHandle = { id: number; kind: 'ric' | 'timeout' };

const scheduleIdle = (cb: () => void, timeoutMs: number): IdleHandle => {
  if (typeof requestIdleCallback !== 'undefined') {
    return {
      id: requestIdleCallback(cb, { timeout: timeoutMs }),
      kind: 'ric',
    };
  }
  return { id: window.setTimeout(cb, 400), kind: 'timeout' };
};

const cancelScheduledIdle = (handle: IdleHandle | undefined) => {
  if (!handle) return;
  if (handle.kind === 'ric' && typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(handle.id);
    return;
  }
  window.clearTimeout(handle.id);
};

const PaginatedArtworkGrid = ({
  objectIds,
  page,
  onPageChange,
}: PaginatedArtworkGridProps) => {
  const location = useLocation();
  const galleryLocation = `${location.pathname}${location.search}`;
  const totalPages = Math.max(1, Math.ceil(objectIds.length / GALLERY_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageIds = useMemo(() => {
    const start = (safePage - 1) * GALLERY_PAGE_SIZE;
    return objectIds.slice(start, start + GALLERY_PAGE_SIZE);
  }, [objectIds, safePage]);

  const queryClient = useQueryClient();

  const queries = useQueries({
    queries: pageIds.map((id) => ({
      queryKey: metObjectQueryKey(id),
      queryFn: ({ signal }) => fetchObjectById(id, signal),
      select: (raw: MetObjectResponse) => ({
        raw,
        artwork: transformArtwork(raw),
      }),
      ...metObjectQueryDefaults,
    })),
  });

  const hasNextPage = safePage < totalPages;

  const nextPageIds = useMemo(() => {
    if (!hasNextPage) return [];
    const start = safePage * GALLERY_PAGE_SIZE;
    return objectIds.slice(start, start + GALLERY_PAGE_SIZE);
  }, [objectIds, safePage, hasNextPage]);

  const currentPageSettled =
    pageIds.length > 0 &&
    queries.length === pageIds.length &&
    queries.every((q) => !q.isPending);

  useEffect(() => {
    if (!currentPageSettled || nextPageIds.length === 0) return;

    const ids = nextPageIds.slice(0, GALLERY_PAGE_SIZE);
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      for (const id of ids) {
        if (cancelled) break;
        void queryClient.prefetchQuery({
          queryKey: metObjectQueryKey(id),
          queryFn: ({ signal }) => fetchObjectById(id, signal),
          ...metObjectQueryDefaults,
        });
      }
    };

    const idleHandle = scheduleIdle(run, 4500);

    return () => {
      cancelled = true;
      cancelScheduledIdle(idleHandle);
    };
  }, [currentPageSettled, nextPageIds, queryClient]);

  const showRateBanner = useMemo(
    () => queries.some((q) => q.isError && isRateLimitApiError(q.error)),
    [queries]
  );

  const detailLoadCounts = useMemo(() => {
    if (pageIds.length === 0 || queries.length !== pageIds.length) {
      return null;
    }
    let ready = 0;
    for (const q of queries) {
      if (q && !q.isPending) ready += 1;
    }
    return { ready, total: pageIds.length };
  }, [pageIds.length, queries]);

  const visibleCards = useMemo(() => {
    const cards: ReactElement[] = [];

    for (let i = 0; i < pageIds.length; i += 1) {
      if (cards.length >= GALLERY_PAGE_SIZE) break;
      const id = pageIds[i];
      const q = queries[i];

      if (!q) {
        cards.push(
          <div key={id}>
            <CardSkeleton />
          </div>
        );
        continue;
      }
      if (q.isError) {
        cards.push(
          <div key={id}>
            <GalleryObjectErrorSlot id={id} query={q} />
          </div>
        );
        continue;
      }
      if (q.isPending) {
        cards.push(
          <div key={id}>
            <CardSkeleton />
          </div>
        );
        continue;
      }
      if (!q.data || !q.data.artwork) {
        continue;
      }
      const a = q.data.artwork;
      cards.push(
        <div key={id}>
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
    }

    return cards;
  }, [galleryLocation, pageIds, queries]);

  return (
    <div className={styles.wrap}>
      {showRateBanner ? (
        <div className={styles.rateBanner} role="status">
          The Metropolitan Museum API is rate limiting. Requests are spaced and
          will retry automatically; use Retry on a card if it stays stuck.
        </div>
      ) : null}
      <Grid>{visibleCards}</Grid>
      {detailLoadCounts && detailLoadCounts.ready < detailLoadCounts.total ? (
        <p className={styles.loadProgress} aria-live="polite">
          Loaded {detailLoadCounts.ready} of {detailLoadCounts.total} previews on
          this page (Met API requests are throttled).
        </p>
      ) : null}

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
          <span className={styles.pageStatus}>
            Page {safePage}
          </span>
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
