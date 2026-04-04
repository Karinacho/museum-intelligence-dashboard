import styles from './CardContent.module.css';

interface CardContentProps {
  tags?: string[];
  name?: string | null;
  artist?: string | null;
  objectDate?: string | null;
}

const CardContent = ({ tags, name, artist, objectDate }: CardContentProps) => {
  return (
    <div className={styles.content}>
      <h3 className={styles.name}>{name}</h3>
      {artist ? <p className={styles.artist}>{artist}</p> : null}
      {objectDate ? <p className={styles.date}>{objectDate}</p> : null}
      {tags && tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardContent;