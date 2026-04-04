import { AppProviders } from '@/app/providers/providers.tsx';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/providers/router.tsx';

const App = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

export default App;
