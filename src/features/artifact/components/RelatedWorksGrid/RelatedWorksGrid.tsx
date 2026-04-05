import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Card, CardSkeleton } from '@/components/ui';
import { fetchObjectById } from '@/features/gallery/api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import {
  isRateLimitApiError,
  metObjectQueryDefaults,
} from '@/lib/api/metObjectQueryOptions';
import { transformArtwork, type MetObjectResponse } from '@/lib/models/artwork';
import styles from './RelatedWorksGrid.module.css';

type RelatedWorksGridProps = {
  ids: number[];
};

const RelatedWorksGrid = ({ ids }: RelatedWorksGridProps) => {
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

  return (
    <>
      {loadCounts && loadCounts.ready < loadCounts.total ? (
        <p className={styles.loadProgress} aria-live="polite">
          Loaded {loadCounts.ready} of {loadCounts.total} related previews…
        </p>
      ) : null}
      <div className={styles.grid}>
      {ids.map((id, i) => {
        const q = queries[i];
        if (!q) {
          return (
            <div key={id} className={styles.cell}>
              <CardSkeleton />
            </div>
          );
        }
        if (q.isError) {
          const rateLimited = isRateLimitApiError(q.error);
          return (
            <div key={id} className={styles.cell}>
              <div className={styles.errorSlot}>
                <p className={styles.errorText}>
                  {rateLimited
                    ? 'The API is limiting requests. Retry in a moment.'
                    : 'Could not load related work.'}
                </p>
                <button
                  type="button"
                  className={styles.retryBtn}
                  onClick={() => q.refetch()}
                >
                  Retry
                </button>
              </div>
            </div>
          );
        }
        if (q.isPending) {
          return (
            <div key={id} className={styles.cell}>
              <CardSkeleton />
            </div>
          );
        }
        if (!q.data) {
          return (
            <div key={id} className={styles.cell}>
              <div className={styles.errorSlot}>
                <p className={styles.errorText}>No preview for this work.</p>
              </div>
            </div>
          );
        }
        const a = q.data;
        return (
          <div key={id} className={styles.cell}>
            <Card
              to={`/artifact/${a.id}`}
              state={{ from: artifactLocation }}
              name={a.title}
              artist={a.artist}
              objectDate={a.dateLine}
              imageSrc={a.imageUrl}
            />
          </div>
        );
      })}
      </div>
    </>
  );
};

export default RelatedWorksGrid;
