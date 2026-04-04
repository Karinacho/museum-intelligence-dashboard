import styles from './CardContainer.module.css';
import CardImage from '@/components/ui/Card/CardImage/CardImage.tsx';
import CardContent from '@/components/ui/Card/CardContent/CardContent.tsx';

export interface CardContainerProps {
  imageSrc?: string | null;
  name?: string | null;
  tags?: string[];
  onClick?: () => void;
}

const CardContainer = ({ imageSrc, name, tags, onClick }: CardContainerProps) => {
  return (
    <article className={styles.card} onClick={onClick}>
      <CardImage imageSrc={imageSrc} name={name} />
      <CardContent name={name} tags={tags}/>
    </article>
  );
};

export default CardContainer;
