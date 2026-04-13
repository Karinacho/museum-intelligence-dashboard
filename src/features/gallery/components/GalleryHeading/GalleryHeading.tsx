import styles from './GalleryHeading.module.css';

const GalleryHeading = () => {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Research gallery</h1>
      </div>
      <p className={styles.subtitle}>
        Curated discovery across The Met collection. Refine by department, date,
        and keyword; every search is reflected in the URL for sharing and
        reload.
      </p>
    </div>
  );
};

export default GalleryHeading;
