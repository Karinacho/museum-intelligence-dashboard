import { RelatedWorkGridCell } from './RelatedWorkGridCell';
import { useRelatedWorksPreviewQueries } from './useRelatedWorksPreviewQueries';
import styles from './RelatedWorksGrid.module.css';

type RelatedWorksGridProps = {
  ids: number[];
};

const RelatedWorksGrid = ({ ids }: RelatedWorksGridProps) => {
  const { queries, artifactLocation } =
    useRelatedWorksPreviewQueries(ids);

  return (
      <div className={styles.grid}>
        {ids.map((id, i) => (
          <RelatedWorkGridCell
            key={id}
            query={queries[i]}
            artifactLocation={artifactLocation}
          />
        ))}
      </div>
  );
};

export default RelatedWorksGrid;
