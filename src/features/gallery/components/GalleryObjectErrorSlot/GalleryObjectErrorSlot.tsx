import type { UseQueryResult } from '@tanstack/react-query';
import { isRateLimitApiError } from '@/lib/api/metObjectQueryOptions';
import type { PageQueryData } from '../../types';
import styles from '../PaginatedArtworkGrid/PaginatedArtworkGrid.module.css';

type GalleryObjectErrorSlotProps = {
  id: number;
  query: UseQueryResult<PageQueryData, Error>;
};

export function GalleryObjectErrorSlot({
  id,
  query,
}: GalleryObjectErrorSlotProps) {
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
