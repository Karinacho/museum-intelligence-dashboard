import styles from '../../pages/ArtifactPage.module.css';

type ArtifactTagsSectionProps = {
  tags: string[];
};

export function ArtifactTagsSection({ tags }: ArtifactTagsSectionProps) {
  return (
    <section className={styles.tagsSection} aria-labelledby="tags-heading">
      <h2 id="tags-heading" className={styles.sectionTitle}>
        Tags
      </h2>
      {tags.length > 0 ? (
        <ul className={styles.tagList} role="list">
          {tags.map((t) => (
            <li key={t} className={styles.tag}>
              {t}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.muted}>
          No tags are listed for this object in the collection API.
        </p>
      )}
    </section>
  );
}
