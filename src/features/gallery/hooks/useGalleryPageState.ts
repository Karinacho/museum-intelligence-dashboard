import { useEffect } from 'react';
import { useFilters } from './useFilters';
import { useGalleryObjectIdsQuery } from './useGalleryObjectIdsQuery.ts';
import { galleryTotalPages } from '../lib/galleryPagination';
import type { UrlGalleryFilters } from '../types';

export type GalleryPageState = {
  isHighlights: boolean;
  currentPage: number;
  setPage: (page: number) => void;
  objectIds: number[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  setFilters: (filters: UrlGalleryFilters) => void;
  resetToHighlights: () => void;
  currentFilters: UrlGalleryFilters;
};

export const useGalleryPageState = (): GalleryPageState => {
  const {
    isHighlights,
    currentPage,
    setPage,
    currentFilters,
    setFilters,
    resetToHighlights,
  } = useFilters();

  const {
    data: objectIds = [],
    isPending,
    isError,
    error,
    isFetching,
  } = useGalleryObjectIdsQuery(currentFilters);

  const totalPages = galleryTotalPages(objectIds.length);

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
    setFilters,
    resetToHighlights,
    currentFilters,
  };
};
