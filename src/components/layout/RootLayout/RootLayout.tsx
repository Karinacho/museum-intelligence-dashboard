import { Outlet } from 'react-router-dom';
import Header from '../Header/Header.tsx';
import styles from './RootLayout.module.css';

const RootLayout = () => {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
};

export default RootLayout;
