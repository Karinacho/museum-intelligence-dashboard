import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, //24 hours
      gcTime: 1000 * 60 * 60 * 24, // 24 hours — must be >= staleTime
      refetchOnMount: false,
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when internet reconnects
    },
  },
});
