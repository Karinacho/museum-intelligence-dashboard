import styles from './CardImage.module.css';

interface CardImageProps {
  imageSrc?: string | null;
  name?: string | null;
}

const CardImage = ({ imageSrc, name }: CardImageProps) => {
  const image = (
    <img
      loading="lazy"
      src={imageSrc!}
      alt={name ? name : 'Artwork not available'}
      className={styles.image}
    />
  );

  const fallback = (
    <div className={styles.noImage} aria-hidden="true">
      No Image Available
    </div>
  );

  return (
    <div className={styles.imageWrapper}>{imageSrc ? image : fallback}</div>
  );
};

export default CardImage;
