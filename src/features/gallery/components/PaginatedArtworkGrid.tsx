import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
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
};

const PaginatedArtworkGrid = ({
  objectIds,
  page,
  onPageChange,
}: PaginatedArtworkGridProps) => {
  const totalPages = Math.max(1, Math.ceil(objectIds.length / GALLERY_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageIds = useMemo(() => {
    const start = (safePage - 1) * GALLERY_PAGE_SIZE;
    return objectIds.slice(start, start + GALLERY_PAGE_SIZE);
  }, [objectIds, safePage]);

  const queries = useQueries({
    queries: pageIds.map((id) => ({
      queryKey: metObjectQueryKey(id),
      queryFn: () => fetchObjectById(id),
      select: (raw: MetObjectResponse) => transformArtwork(raw),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });

  const from = (safePage - 1) * GALLERY_PAGE_SIZE + 1;
  const to = Math.min(safePage * GALLERY_PAGE_SIZE, objectIds.length);

  return (
    <div className={styles.wrap}>
      <Grid>
        {pageIds.map((id, i) => {
          const q = queries[i];
          if (!q || q.isLoading) {
            return (
              <div key={id}>
                <CardSkeleton />
              </div>
            );
          }
          if (q.isError || !q.data) {
            return (
              <div key={id}>
                <Card
                  name="Unavailable"
                  artist={null}
                  objectDate={null}
                  imageSrc={null}
                />
              </div>
            );
          }
          const a = q.data;
          return (
            <div key={id}>
              <Card
                to={`/artifact/${a.id}`}
                name={a.title}
                artist={a.artist}
                objectDate={a.dateLine}
                imageSrc={a.imageUrl}
              />
            </div>
          );
        })}
      </Grid>

      <nav className={styles.pagination} aria-label="Gallery pages">
        <p className={styles.range}>
          {from}–{to} of {objectIds.length.toLocaleString()}
        </p>
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
            Page {safePage} of {totalPages.toLocaleString()}
          </span>
          <button
            type="button"
            className={styles.navBtn}
            disabled={safePage >= totalPages}
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
