import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import {
  type UrlGalleryFilters,
  parseFiltersFromParams,
  isHighlightsMode,
  parsePageFromParams,
} from '../lib/resolveGallerySearch';

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentFilters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams]
  );

  const currentPage = useMemo(
    () => parsePageFromParams(searchParams),
    [searchParams]
  );

  const isHighlights = isHighlightsMode(currentFilters);

  const setFilters = useCallback(
    (next: UrlGalleryFilters) => {
      const params = new URLSearchParams();

      if (next.departmentId !== undefined) {
        params.set('dept', String(next.departmentId));
      }
      if (next.keyword !== undefined && next.keyword.trim() !== '') {
        params.set('keyword', next.keyword.trim());
      }
      if (next.dateBegin !== undefined) {
        params.set('dateBegin', String(next.dateBegin));
      }
      if (next.dateEnd !== undefined) {
        params.set('dateEnd', String(next.dateEnd));
      }

      setSearchParams(params);
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(searchParams);
      if (page <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(page));
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const resetToHighlights = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    currentFilters,
    currentPage,
    isHighlights,
    setFilters,
    setPage,
    resetToHighlights,
  };
};
