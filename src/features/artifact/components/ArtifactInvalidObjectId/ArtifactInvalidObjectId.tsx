import { ArtifactPageNav } from '../ArtifactPageNav/ArtifactPageNav';
import styles from '../../pages/ArtifactPage.module.css';

type ArtifactInvalidObjectIdProps = {
  backTo: string;
};

export function ArtifactInvalidObjectId({ backTo }: ArtifactInvalidObjectIdProps) {
  return (
    <div className={styles.page}>
      <ArtifactPageNav backTo={backTo} />
      <p className={styles.alert} role="alert">
        This URL does not contain a valid object id.
      </p>
    </div>
  );
}
