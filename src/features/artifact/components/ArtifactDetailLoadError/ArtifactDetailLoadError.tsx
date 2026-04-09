import styles from '../../pages/ArtifactPage.module.css';

type ArtifactDetailLoadErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function ArtifactDetailLoadError({
  error,
  onRetry,
}: ArtifactDetailLoadErrorProps) {
  return (
    <div className={styles.alert} role="alert">
      <p>
        {error instanceof Error
          ? error.message
          : 'Something went wrong while loading this object.'}
      </p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
