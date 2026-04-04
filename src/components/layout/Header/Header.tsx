import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>Museum Intelligence</h1>
        <p className={styles.description}>Research tools · The Metropolitan Museum of Art Open Access</p>
      </div>
    </header>
  );
};

export default Header;
