import styles from './RelatedWorksGrid.module.css';

type RelatedWorksLoadProgressProps = {
  loadCounts: { ready: number; total: number } | null;
};

export function RelatedWorksLoadProgress({
  loadCounts,
}: RelatedWorksLoadProgressProps) {
  if (!loadCounts || loadCounts.ready >= loadCounts.total) return null;

  return (
    <p className={styles.loadProgress} aria-live="polite">
      Loaded {loadCounts.ready} of {loadCounts.total} related previews…
    </p>
  );
}
