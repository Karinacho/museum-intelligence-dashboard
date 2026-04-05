import { useQueries } from '@tanstack/react-query';
import { fetchObjectById } from '../api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import { metObjectQueryDefaults } from '@/lib/api/metObjectQueryOptions';
import {
  transformArtwork,
  type ArtworkCard,
  type MetObjectResponse,
} from '@/lib/models/artwork';

export const useObjectsBatch = (ids: number[] = []) => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: metObjectQueryKey(id),
      queryFn: ({ signal }) => fetchObjectById(id, signal),
      select: (raw: MetObjectResponse) => transformArtwork(raw),
      ...metObjectQueryDefaults,
    })),
  });
};

export const useArtworks = (ids: number[] = []) => {
  const queries = useObjectsBatch(ids);

  /** v5: `isLoading` is only true while fetching; `isPending` means no result yet. */
  const isLoading = queries.some((q) => q.isPending);
  const isError = queries.some((q) => q.isError);

  const artworks = queries
    .map((q) => q.data)
    .filter((artwork): artwork is ArtworkCard => artwork !== null);

  return {
    artworks,
    isLoading,
    isError,
    queryStates: queries.map((q) => ({
      isLoading: q.isPending,
      isError: q.isError,
      data: q.data,
    })),
  };
};
