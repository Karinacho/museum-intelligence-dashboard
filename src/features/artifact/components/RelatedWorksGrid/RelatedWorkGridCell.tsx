import type { UseQueryResult } from '@tanstack/react-query';
import { Card, CardSkeleton } from '@/components/ui';
import { isRateLimitApiError } from '@/lib/api/metObjectQueryOptions';
import type { ArtworkCard } from '@/lib/models/artwork';
import styles from './RelatedWorksGrid.module.css';

type RelatedWorkGridCellProps = {
  query: UseQueryResult<ArtworkCard | null> | undefined;
  artifactLocation: string;
};

export function RelatedWorkGridCell({
  query,
  artifactLocation,
}: RelatedWorkGridCellProps) {
  if (!query) {
    return (
      <div className={styles.cell}>
        <CardSkeleton />
      </div>
    );
  }

  if (query.isError) {
    const rateLimited = isRateLimitApiError(query.error);
    return (
      <div className={styles.cell}>
        <div className={styles.errorSlot}>
          <p className={styles.errorText}>
            {rateLimited
              ? 'The API is limiting requests. Retry in a moment.'
              : 'Could not load related work.'}
          </p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => query.refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className={styles.cell}>
        <CardSkeleton />
      </div>
    );
  }

  if (!query.data) {
    return (
      <div className={styles.cell}>
        <div className={styles.errorSlot}>
          <p className={styles.errorText}>No preview for this work.</p>
        </div>
      </div>
    );
  }

  const a = query.data;
  return (
    <div className={styles.cell}>
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
}
