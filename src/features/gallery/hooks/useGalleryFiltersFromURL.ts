import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { type GalleryFilters, DEFAULT_GALLERY_FILTERS } from '../types/filters';

/**
 * Hook to sync gallery filters with URL search params
 *
 * URL format:
 * /gallery?dept=11&dateBegin=-500&dateEnd=100&keyword=vase&page=2
 *
 * Benefits:
 * - Deep linking: Share specific searches
 * - State restoration: Refresh preserves filters
 * - Browser navigation: Back/forward works
 *
 * @returns Filters from URL and function to update them
 */
export const useGalleryFiltersFromURL = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters = useMemo((): GalleryFilters => {
    const deptParam = searchParams.get('dept');
    const dateBeginParam = searchParams.get('dateBegin');
    const dateEndParam = searchParams.get('dateEnd');
    const keywordParam = searchParams.get('keyword');
    const hasImagesParam = searchParams.get('hasImages');
    const isHighlightParam = searchParams.get('isHighlight');

    // If no URL params, use defaults (Highlights)
    if (
      !deptParam &&
      !dateBeginParam &&
      !dateEndParam &&
      !keywordParam &&
      hasImagesParam === null &&
      isHighlightParam === null
    ) {
      return DEFAULT_GALLERY_FILTERS;
    }

    // Build filters from URL params
    const urlFilters: GalleryFilters = {};

    if (deptParam) {
      urlFilters.departmentId = parseInt(deptParam, 10);
    }

    if (dateBeginParam) {
      urlFilters.dateBegin = parseInt(dateBeginParam, 10);
    }

    if (dateEndParam) {
      urlFilters.dateEnd = parseInt(dateEndParam, 10);
    }

    if (keywordParam) {
      urlFilters.keyword = keywordParam;
    }

    if (hasImagesParam !== null) {
      urlFilters.hasImages = hasImagesParam === 'true';
    }

    if (isHighlightParam !== null) {
      urlFilters.isHighlight = isHighlightParam === 'true';
    }

    return urlFilters;
  }, [searchParams]);

  // Get current page from URL
  const currentPage = useMemo(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 0;
  }, [searchParams]);

  // Update filters in URL
  const setFilters = useCallback(
    (newFilters: GalleryFilters, page: number = 0) => {
      const params = new URLSearchParams();

      if (newFilters.departmentId !== undefined) {
        params.set('dept', String(newFilters.departmentId));
      }

      if (newFilters.dateBegin !== undefined) {
        params.set('dateBegin', String(newFilters.dateBegin));
      }

      if (newFilters.dateEnd !== undefined) {
        params.set('dateEnd', String(newFilters.dateEnd));
      }

      if (newFilters.keyword) {
        params.set('keyword', newFilters.keyword);
      }

      if (newFilters.hasImages !== undefined) {
        params.set('hasImages', String(newFilters.hasImages));
      }

      if (newFilters.isHighlight !== undefined) {
        params.set('isHighlight', String(newFilters.isHighlight));
      }

      if (page > 0) {
        params.set('page', String(page));
      }

      setSearchParams(params);
    },
    [setSearchParams]
  );

  // Update only page in URL
  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);

      if (page > 0) {
        params.set('page', String(page));
      } else {
        params.delete('page');
      }

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  return {
    filters,
    currentPage,
    setFilters,
    setPage,
  };
};
