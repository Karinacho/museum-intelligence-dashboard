import { useMemo, useEffect } from 'react';
import type { UrlGalleryFilters } from '../lib/resolveGallerySearch';
import { useFilters } from './useFilters';
import { useGalleryObjectIds } from './useGalleryObjectIds';
import { GALLERY_PAGE_SIZE } from '../components/PaginatedArtworkGrid/PaginatedArtworkGrid.tsx';

export type GalleryPageState = {
  isHighlights: boolean;
  currentPage: number;
  setPage: (page: number) => void;
  objectIds: number[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
};

export const useGalleryPageState = (
  urlState: UrlGalleryFilters
): GalleryPageState => {
  const { isHighlights, currentPage, setPage } = useFilters();
  const { data: objectIds = [], isPending, isError, error, isFetching } =
    useGalleryObjectIds(urlState);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(objectIds.length / GALLERY_PAGE_SIZE)),
    [objectIds.length]
  );

  useEffect(() => {
    if (objectIds.length > 0 && currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [objectIds.length, currentPage, totalPages, setPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return {
    isHighlights,
    currentPage,
    setPage,
    objectIds,
    isPending,
    isError,
    error: error ?? null,
    isFetching,
  };
};
