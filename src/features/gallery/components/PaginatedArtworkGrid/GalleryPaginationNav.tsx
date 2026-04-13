import styles from './PaginatedArtworkGrid.module.css';

export type GalleryPaginationNavProps =
  | { variant: 'loading' }
  | {
      variant: 'ready';
      safePage: number;
      hasNextPage: boolean;
      onPageChange: (page: number) => void;
    };

export function GalleryPaginationNav(props: GalleryPaginationNavProps) {
  
  if (props.variant === 'loading') {
    return (
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
    );
  }

  const { safePage, hasNextPage, onPageChange } = props;
  
  return (
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
  );
}
