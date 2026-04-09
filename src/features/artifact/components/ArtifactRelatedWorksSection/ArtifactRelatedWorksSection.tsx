import RelatedWorksGrid from '../RelatedWorksGrid/RelatedWorksGrid';
import {
  RELATED_PERIOD_RADIUS,
  type RelatedWorksReadiness,
} from '../../lib/relatedWorks';
import styles from '../../pages/ArtifactPage.module.css';

type ArtifactRelatedWorksSectionProps = {
  readiness: RelatedWorksReadiness;
  departmentsLoading: boolean;
  relatedIds: number[];
  relatedIdsPending: boolean;
  relatedIdsError: boolean;
};

export function ArtifactRelatedWorksSection({
  readiness,
  departmentsLoading,
  relatedIds,
  relatedIdsPending,
  relatedIdsError,
}: ArtifactRelatedWorksSectionProps) {
  return (
    <section
      className={styles.relatedSection}
      aria-labelledby="related-heading"
    >
      <h2 id="related-heading" className={styles.sectionTitle}>
        Related works
      </h2>
      <p className={styles.relatedExplainer}>
        Suggestions share the same department and an approximate ±
        {RELATED_PERIOD_RADIUS} year window from catalog begin/end dates (or
        parsed display date when needed).
      </p>

      {departmentsLoading ? (
        <p className={styles.muted}>Loading department directory…</p>
      ) : null}

      {!departmentsLoading && readiness.status === 'no-department' ? (
        <p className={styles.muted}>
          This record’s department label does not match the museum directory, so
          same-department suggestions are not available.
        </p>
      ) : null}

      {!departmentsLoading && readiness.status === 'no-date' ? (
        <p className={styles.muted}>
          There is not enough structured date information to define a period
          window for suggestions.
        </p>
      ) : null}

      {readiness.status === 'ok' && relatedIdsError ? (
        <p className={styles.muted} role="alert">
          Related works could not be loaded.
        </p>
      ) : null}

      {readiness.status === 'ok' && relatedIdsPending ? (
        <p className={styles.muted}>Searching the collection…</p>
      ) : null}

      {readiness.status === 'ok' &&
      !relatedIdsPending &&
      !relatedIdsError &&
      relatedIds.length === 0 ? (
        <p className={styles.muted}>
          No other works in this department fall within the computed date
          window.
        </p>
      ) : null}

      {readiness.status === 'ok' &&
      relatedIds.length > 0 &&
      !relatedIdsPending ? (
        <RelatedWorksGrid ids={relatedIds} />
      ) : null}
    </section>
  );
}
