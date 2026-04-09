import { useMemo, useEffect } from 'react';
import { useFilters } from './useFilters';
import { useGalleryObjectIdsQuery } from './useGalleryObjectIdsQuery.ts';
import { GALLERY_PAGE_SIZE } from '../lib/constants.ts';
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(objectIds.length / GALLERY_PAGE_SIZE)),
    [objectIds.length]
  );

  //if the current page is greater than the total pages, set the page to the total pages
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
