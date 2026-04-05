import styles from './GalleryStatusMessages.module.css';

interface Props {
    isError: boolean;
    error: unknown;
    isPending: boolean;
    isFetching: boolean;
    isHighlights: boolean;
    resultCount: number;
  }
  
  export const GalleryStatusMessages = ({
    isError, error, isPending, isFetching, isHighlights, resultCount,
  }: Props) => {
    if (isError) {
      return (
        <p className={styles.message} role="alert">
          {error instanceof Error ? error.message : 'Could not load search results.'}
        </p>
      );
    }
  
    if (!isPending && resultCount === 0) {
      return <p className={styles.message}>No works match these filters.</p>;
    }
  
    if (resultCount === 0 && isPending) {
      return <p className={styles.message} aria-live="polite" aria-busy="true">Loading results…</p>;
    }
  
    return (
      <>
        <p className={styles.stats} aria-live="polite" aria-busy={!isHighlights && isFetching}>
          {isHighlights || resultCount > 10_000
            ? 'More than 10,000 results'
            : `${resultCount.toLocaleString()} works`}
        </p>
        {isHighlights && (
          <p className={styles.message} aria-live="polite">
            Showing highlighted works. Add filters to broaden or narrow the set.
          </p>
        )}
        {!isHighlights && isFetching && (
          <p className={styles.message} aria-live="polite">Updating results…</p>
        )}
      </>
    );
  };