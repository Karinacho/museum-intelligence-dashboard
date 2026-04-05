import { Link } from 'react-router-dom';
import styles from './CardContainer.module.css';
import CardImage from '@/components/ui/Card/CardImage/CardImage.tsx';
import CardContent from '@/components/ui/Card/CardContent/CardContent.tsx';

export interface CardContainerProps {
  imageSrc?: string | null;
  name?: string | null;
  artist?: string | null;
  objectDate?: string | null;
  tags?: string[];
  to?: string;
  state?: unknown;
}

const CardContainer = ({
  imageSrc,
  name,
  artist,
  objectDate,
  tags,
  to,
  state,
}: CardContainerProps) => {
  const article = (
    <article className={styles.card}>
      <CardImage imageSrc={imageSrc} name={name} />
      <CardContent
        name={name}
        artist={artist}
        objectDate={objectDate}
        tags={tags}
      />
    </article>
  );

  if (to) {
    return (
      <Link to={to} state={state} className={styles.cardLink}>
        {article}
      </Link>
    );
  }

  return article;
};

export default CardContainer;
