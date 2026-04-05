import styles from './CardSkeleton.module.css';

const CardSkeleton = () => {
  return (
    <article className={`${styles.card} ${styles.skeleton}`}>
      <div className={`${styles.imageWrapper} ${styles.skeletonImage}`} />
      <div className={styles.content}>
        <div className={`${styles.skeletonText} ${styles.skeletonName}`} />
        <div className={styles.tags}>
          <span className={`${styles.tag} ${styles.skeletonTag}`} />
          <span className={`${styles.tag} ${styles.skeletonTag}`} />
        </div>
      </div>
    </article>
  );
};

export default CardSkeleton;
