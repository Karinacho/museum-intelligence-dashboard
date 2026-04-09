import type { ArtworkDetail } from '@/lib/models/artwork';
import styles from '../../pages/ArtifactPage.module.css';

type ArtifactDetailFactsProps = {
  detail: ArtworkDetail;
};

export function ArtifactDetailFacts({ detail }: ArtifactDetailFactsProps) {
  return (
    <dl className={styles.facts}>
      <div className={styles.fact}>
        <dt>Accession number</dt>
        <dd>{detail.accessionNumber}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Medium</dt>
        <dd>{detail.medium}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Dimensions</dt>
        <dd>{detail.dimensions}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Department</dt>
        <dd>{detail.department}</dd>
      </div>
      {detail.culture !== 'Unknown' ? (
        <div className={styles.fact}>
          <dt>Culture</dt>
          <dd>{detail.culture}</dd>
        </div>
      ) : null}
      {detail.period !== 'Unknown' ? (
        <div className={styles.fact}>
          <dt>Period</dt>
          <dd>{detail.period}</dd>
        </div>
      ) : null}
    </dl>
  );
}
