import { useCallback, useState } from 'react';
import styles from '../../pages/ArtifactPage.module.css';

type ArtifactHeroImageProps = {
  small: string | null;
  large: string | null;
};

export function ArtifactHeroImage({ small, large }: ArtifactHeroImageProps) {
  const [hiResLoaded, setHiResLoaded] = useState(false);
  const onLoad = useCallback(() => setHiResLoaded(true), []);

  const hasAny = large || small;
  if (!hasAny) {
    return (
      <div className={styles.hero}>
        <div
          className={styles.heroPlaceholder}
          role="img"
          aria-label="No image available"
        >
          No image available
        </div>
      </div>
    );
  }

  const showSmallFirst = !!large && !!small && !hiResLoaded;

  return (
    <div className={styles.hero}>
      {showSmallFirst && <img src={small} alt="" className={styles.heroImg} />}
      <img
        src={(large || small)!}
        alt=""
        className={styles.heroImg}
        onLoad={large ? onLoad : undefined}
        style={
          showSmallFirst
            ? { position: 'absolute', opacity: 0, pointerEvents: 'none' }
            : undefined
        }
      />
    </div>
  );
}
