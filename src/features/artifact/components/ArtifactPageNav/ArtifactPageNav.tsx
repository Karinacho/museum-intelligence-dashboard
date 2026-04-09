import { Link } from 'react-router-dom';
import styles from '../../pages/ArtifactPage.module.css';

type ArtifactPageNavProps = {
  backTo: string;
};

export function ArtifactPageNav({ backTo }: ArtifactPageNavProps) {
  return (
    <nav className={styles.nav}>
      <Link to={backTo} className={styles.back}>
        ← Research gallery
      </Link>
    </nav>
  );
}
