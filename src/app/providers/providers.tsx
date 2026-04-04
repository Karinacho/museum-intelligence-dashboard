import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/app/providers/queryClient.tsx';
import { fetchAllObjectIds } from '@/features/gallery/api/galleryApi';
import type { ReactNode } from 'react';

queryClient.prefetchQuery({
  queryKey: ['objectIds'],
  queryFn: fetchAllObjectIds,
  staleTime: Infinity,
  gcTime: Infinity,
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
