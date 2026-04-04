import styles from './Card.module.css';
import CardImage from "@/components/ui/Card/CardImage/CardImage.tsx";

export interface CardProps {
  imageSrc?: string;
  name?: string;
  tags?: string[];
  onClick?: () => void;
}

const Card = ({ imageSrc, name, tags, onClick }: CardProps) => {
  return (
    <article className={styles.card} onClick={onClick}>

        <CardImage imageSrc={imageSrc} name={name} />
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
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
    </article>
  );
};

export default Card;
