import type { ArtworkDetail } from '@/lib/models/artwork';
import type { RelatedWorksReadiness } from '../../lib/relatedWorks';
import { ArtifactCreditSection } from '../ArtifactCreditSection/ArtifactCreditSection';
import { ArtifactDetailFacts } from '../ArtifactDetailFacts/ArtifactDetailFacts';
import { ArtifactDetailHeader } from '../ArtifactDetailHeader/ArtifactDetailHeader';
import { ArtifactHeroImage } from '../ArtifactHeroImage/ArtifactHeroImage';
import { ArtifactRelatedWorksSection } from '../ArtifactRelatedWorksSection/ArtifactRelatedWorksSection';
import { ArtifactTagsSection } from '../ArtifactTagsSection/ArtifactTagsSection';
import styles from '../../pages/ArtifactPage.module.css';

type ArtifactDetailArticleProps = {
  detail: ArtworkDetail;
  readiness: RelatedWorksReadiness;
  departmentsLoading: boolean;
  relatedIds: number[];
  relatedIdsPending: boolean;
  relatedIdsError: boolean;
};

export function ArtifactDetailArticle({
  detail,
  readiness,
  departmentsLoading,
  relatedIds,
  relatedIdsPending,
  relatedIdsError,
}: ArtifactDetailArticleProps) {
  return (
    <article className={styles.article}>
      <ArtifactHeroImage
        key={detail.id}
        small={detail.imageUrl}
        large={detail.primaryImageLarge}
      />

      <div className={styles.body}>
        <ArtifactDetailHeader detail={detail} />
        <ArtifactDetailFacts detail={detail} />
        <ArtifactCreditSection creditLine={detail.creditLine} />
        <ArtifactTagsSection tags={detail.tags} />
        <ArtifactRelatedWorksSection
          readiness={readiness}
          departmentsLoading={departmentsLoading}
          relatedIds={relatedIds}
          relatedIdsPending={relatedIdsPending}
          relatedIdsError={relatedIdsError}
        />
      </div>
    </article>
  );
}
