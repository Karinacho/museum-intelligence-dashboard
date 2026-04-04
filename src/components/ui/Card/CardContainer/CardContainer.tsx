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
  onClick?: () => void;
  /** When set, the whole card navigates as a link (preferred over onClick). */
  to?: string;
  state?: unknown;
}

const CardContainer = ({
  imageSrc,
  name,
  artist,
  objectDate,
  tags,
  onClick,
  to,
  state,
}: CardContainerProps) => {
  const article = (
    <article className={styles.card} onClick={onClick}>
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
