import styles from './CardContent.module.css'

interface CardContentProps {
    tags?: string[];
    name?: string | null;
}

const CardContent = ({tags, name}: CardContentProps) => {

    return (
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
    )
}

export default CardContent;