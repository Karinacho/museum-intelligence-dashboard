import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Card, CardSkeleton } from '@/components/ui';
import Grid from '@/components/layout/Grid/Grid';
import { fetchObjectById } from '../api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import { transformArtwork, type MetObjectResponse } from '@/lib/models/artwork';
import styles from './PaginatedArtworkGrid.module.css';

export const GALLERY_PAGE_SIZE = 20;

type PaginatedArtworkGridProps = {
  objectIds: number[];
  page: number;
  onPageChange: (page: number) => void;
  dateBegin?: number;
  dateEnd?: number;
};

const isFiniteYear = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const toComparableYear = (value: number): number => value;

const isInSelectedDateWindow = (
  raw: MetObjectResponse,
  dateBegin?: number,
  dateEnd?: number
): boolean => {
  if (dateBegin === undefined && dateEnd === undefined) return true;

  const begin = isFiniteYear(raw.objectBeginDate)
    ? toComparableYear(raw.objectBeginDate)
    : undefined;
  const end = isFiniteYear(raw.objectEndDate)
    ? toComparableYear(raw.objectEndDate)
    : undefined;

  if (begin !== undefined || end !== undefined) {
    const min = Math.min(begin ?? end!, end ?? begin!);
    const max = Math.max(begin ?? end!, end ?? begin!);
    const lower = dateBegin ?? Number.NEGATIVE_INFINITY;
    const upper = dateEnd ?? Number.POSITIVE_INFINITY;
    // Keep objects whose known production interval intersects selected bounds.
    return max >= lower && min <= upper;
  }

  const fallback = transformArtwork(raw)?.structuredDate;
  if (!fallback) return true;
  const year = fallback.era === 'BCE' ? -fallback.year : fallback.year;
  if (dateBegin !== undefined && year < dateBegin) return false;
  if (dateEnd !== undefined && year > dateEnd) return false;
  return true;
};

const PaginatedArtworkGrid = ({
  objectIds,
  page,
  onPageChange,
  dateBegin,
  dateEnd,
}: PaginatedArtworkGridProps) => {
  const location = useLocation();
  const galleryLocation = `${location.pathname}${location.search}`;
  const totalPages = Math.max(1, Math.ceil(objectIds.length / GALLERY_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const hasDateFilter = dateBegin !== undefined || dateEnd !== undefined;
  const BACKFILL_MULTIPLIER = hasDateFilter ? 3 : 1;

  const pageIds = useMemo(() => {
    const start = (safePage - 1) * GALLERY_PAGE_SIZE;
    return objectIds.slice(start, start + GALLERY_PAGE_SIZE * BACKFILL_MULTIPLIER);
  }, [objectIds, safePage, BACKFILL_MULTIPLIER]);

  const queries = useQueries({
    queries: pageIds.map((id) => ({
      queryKey: metObjectQueryKey(id),
      queryFn: () => fetchObjectById(id),
      select: (raw: MetObjectResponse) => ({
        raw,
        artwork: transformArtwork(raw),
      }),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: 1000 * 60 * 30,
      retry: 0,
    })),
  });

  const hasNextPage = safePage < totalPages;
  const visibleCards = useMemo(() => {
    const cards: JSX.Element[] = [];

    for (let i = 0; i < pageIds.length; i += 1) {
      if (cards.length >= GALLERY_PAGE_SIZE) break;
      const id = pageIds[i];
      const q = queries[i];

      if (!q || q.isLoading) {
        cards.push(
          <div key={id}>
            <CardSkeleton />
          </div>
        );
        continue;
      }
      if (q.isError || !q.data || !q.data.artwork) {
        continue;
      }
      if (!isInSelectedDateWindow(q.data.raw, dateBegin, dateEnd)) {
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
  }, [dateBegin, dateEnd, galleryLocation, pageIds, queries]);

  return (
    <div className={styles.wrap}>
      <Grid>{visibleCards}</Grid>

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
