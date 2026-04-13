import styles from '../../pages/ArtifactPage.module.css';

type ArtifactCreditSectionProps = {
  creditLine: string;
};

export function ArtifactCreditSection({ creditLine }: ArtifactCreditSectionProps) {
  return (
    <section
      className={styles.creditSection}
      aria-labelledby="credit-heading"
    >
      <h2 id="credit-heading" className={styles.sectionTitle}>
        Credit line
      </h2>
      <p className={styles.credit}>{creditLine}</p>
    </section>
  );
}
