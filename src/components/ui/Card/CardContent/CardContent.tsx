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
      <h3 className={styles.name}>{name ? name : 'Untitled'}</h3>
      <p className={styles.artist}>{artist ? artist : 'Unknown artist'}</p> 
      <p className={styles.date}>{objectDate ? objectDate : 'Unknown date'}</p>
      {tags && tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardContent;