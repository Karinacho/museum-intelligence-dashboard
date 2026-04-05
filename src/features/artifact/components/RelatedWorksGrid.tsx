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

  return (
    <div className={styles.grid}>
      {ids.map((id, i) => {
        const q = queries[i];
        if (!q || q.isLoading) {
          return (
            <div key={id} className={styles.cell}>
              <CardSkeleton />
            </div>
          );
        }
        if (q.isError || !q.data) {
          const rateLimited = q.isError && isRateLimitApiError(q.error);
          return (
            <div key={id} className={styles.cell}>
              <div className={styles.errorSlot}>
                <p className={styles.errorText}>
                  {rateLimited
                    ? 'The API is limiting requests. Retry in a moment.'
                    : q.isError
                      ? 'Could not load related work.'
                      : 'No preview for this work.'}
                </p>
                {q.isError ? (
                  <button
                    type="button"
                    className={styles.retryBtn}
                    onClick={() => q.refetch()}
                  >
                    Retry
                  </button>
                ) : null}
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
  );
};

export default RelatedWorksGrid;
