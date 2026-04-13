import type { ArtworkDetail } from '@/lib/models/artwork';
import styles from '../../pages/ArtifactPage.module.css';

type ArtifactDetailHeaderProps = {
  detail: ArtworkDetail;
};

export function ArtifactDetailHeader({ detail }: ArtifactDetailHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{detail.title}</h1>
      <p className={styles.lede}>
        <span>{detail.artist}</span>
        <span className={styles.dot} aria-hidden>
          ·
        </span>
        <span>{detail.dateLine}</span>
      </p>
      {detail.objectUrl ? (
        <a
          href={detail.objectUrl}
          className={styles.external}
          target="_blank"
          rel="noreferrer noopener"
        >
          View on The Met website
        </a>
      ) : null}
    </header>
  );
}
