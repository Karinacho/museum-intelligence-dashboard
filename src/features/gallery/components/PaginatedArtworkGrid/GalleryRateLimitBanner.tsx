import styles from './PaginatedArtworkGrid.module.css';

export function GalleryRateLimitBanner() {
  return (
    <div className={styles.rateBanner} role="status">
      The Metropolitan Museum API is rate limiting. Requests are spaced and will
      retry automatically; use Retry on a card if it stays stuck.
    </div>
  );
}
