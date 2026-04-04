import { useQueries } from '@tanstack/react-query';
import { fetchObjectById } from '../api/galleryApi';
import { transformArtwork, type ArtworkCard } from '@/lib/models/artwork';

export const useObjectsBatch = (ids: number[] = []) => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['object', id] as const,
      queryFn: async () => {
        try {
          const response = await fetchObjectById(id);
          return transformArtwork(response);
        } catch {
          return null;
        }
      },
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });
};

export const useArtworks = (ids: number[] = []) => {
  const queries = useObjectsBatch(ids);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const artworks = queries
    .map((q) => q.data)
    .filter((artwork): artwork is ArtworkCard => artwork !== null);

  return {
    artworks,
    isLoading,
    isError,
    queryStates: queries.map((q) => ({
      isLoading: q.isLoading,
      isError: q.isError,
      data: q.data,
    })),
  };
};
