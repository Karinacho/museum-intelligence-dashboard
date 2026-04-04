import styles from './Card.module.css';

export interface CardProps {
  imageSrc?: string;
  name: string;
  tags?: string[];
  onClick?: () => void;
}

const Card = ({ imageSrc, name, tags, onClick }: CardProps) => {
  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        {imageSrc ? (
          <img src={imageSrc} alt={name} className={styles.image} />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default Card;
