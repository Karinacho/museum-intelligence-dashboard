import styles from './CardImage.module.css';

interface CardImageProps {
    imageSrc?: string;
    name?: string
}

const CardImage = ({imageSrc, name}: CardImageProps) => {
    return (
        <div className={styles.imageWrapper}>

            {imageSrc ? (
                <img src={imageSrc} alt={name} className={styles.image} />
            ) : (
                <div className={styles.noImage}>No Image</div>
            )}

        </div>
    )
}

export default CardImage;