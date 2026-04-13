import { useDepartments } from '@/features/gallery/hooks/useDepartments';
import { ArtifactDetailArticle } from '../../components/ArtifactDetailArticle/ArtifactDetailArticle';
import { ArtifactDetailLoadError } from '../../components/ArtifactDetailLoadError/ArtifactDetailLoadError';
import { ArtifactPageNav } from '../../components/ArtifactPageNav/ArtifactPageNav';
import { useArtifactDetail } from '../../hooks/useArtifactDetail';
import { useRelatedWorkIds } from '../../hooks/useRelatedWorkIds';
import styles from '../ArtifactPage.module.css';

type ArtifactDetailPageProps = {
  objectId: number;
  backTo: string;
};

export function ArtifactDetailPage({ objectId, backTo }: ArtifactDetailPageProps) {
  const {
    data: detail,
    isPending,
    isError,
    error,
    refetch,
  } = useArtifactDetail(objectId);

  const { data: departments, isPending: departmentsLoading } = useDepartments();

  const {
    data: relatedIds = [],
    isPending: relatedIdsPending,
    isError: relatedIdsError,
    relatedWorksStatus,
  } = useRelatedWorkIds({
    artifactId: objectId,
    detail: detail ?? null,
    departments,
    departmentsLoading,
  });

  return (
    <div className={styles.page}>
      <ArtifactPageNav backTo={backTo} />

      {isPending && <p className={styles.message}>Loading artifact…</p>}

      {isError && (
        <ArtifactDetailLoadError error={error} onRetry={() => refetch()} />
      )}

      {!isPending && !isError && detail == null && (
        <p className={styles.message}>
          The museum could not supply a displayable record for this id.
        </p>
      )}

      {detail ? (
        <ArtifactDetailArticle
          detail={detail}
          relatedWorksStatus={relatedWorksStatus}
          departmentsLoading={departmentsLoading}
          relatedIds={relatedIds}
          relatedIdsPending={relatedIdsPending}
          relatedIdsError={relatedIdsError}
        />
      ) : null}
    </div>
  );
}
