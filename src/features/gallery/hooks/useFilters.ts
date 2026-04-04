import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import {
  type UrlGalleryFilters,
  parseUrlGalleryFilters,
  isHighlightsMode,
  isDepartmentOnlyMode,
  buildMetSearchQueryString,
} from '../lib/resolveGallerySearch';

const parsePageFromParams = (searchParams: URLSearchParams): number => {
  const raw = searchParams.get('page');
  if (raw === null || raw === '') return 1;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
};

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlState = useMemo(
    () => parseUrlGalleryFilters(searchParams),
    [searchParams]
  );

  const currentPage = useMemo(
    () => parsePageFromParams(searchParams),
    [searchParams]
  );

  const isHighlights = useMemo(() => isHighlightsMode(urlState), [urlState]);
  const isDeptOnly = useMemo(() => isDepartmentOnlyMode(urlState), [urlState]);

  const metSearchQueryString = useMemo(
    () => buildMetSearchQueryString(urlState),
    [urlState]
  );

  const setFilters = useCallback(
    (next: UrlGalleryFilters) => {
      const params = new URLSearchParams();

      if (next.departmentId !== undefined) {
        params.set('dept', String(next.departmentId));
      }
      if (next.dateBegin !== undefined) {
        params.set('dateBegin', String(next.dateBegin));
      }
      if (next.dateEnd !== undefined) {
        params.set('dateEnd', String(next.dateEnd));
      }
      if (next.keyword !== undefined && next.keyword.trim() !== '') {
        params.set('keyword', next.keyword.trim());
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
    urlState,
    currentPage,
    isHighlights,
    isDeptOnly,
    metSearchQueryString,
    setFilters,
    setPage,
    resetToHighlights,
  };
};
