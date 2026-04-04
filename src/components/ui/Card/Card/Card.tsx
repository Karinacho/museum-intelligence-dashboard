import styles from './Card.module.css';
import CardImage from '@/components/ui/Card/CardImage/CardImage.tsx';
import CardContent from '@/components/ui/Card/CardContent/CardContent.tsx';

export interface CardProps {
  imageSrc?: string | null;
  name?: string | null;
  tags?: string[];
  onClick?: () => void;
}

const Card = ({ imageSrc, name, tags, onClick }: CardProps) => {
  return (
    <article className={styles.card} onClick={onClick}>
      <CardImage imageSrc={imageSrc} name={name} />
      <CardContent name={name} tags={tags}/>
    </article>
  );
};

export default Card;
