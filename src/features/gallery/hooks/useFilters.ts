import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import {
  type UrlGalleryFilters,
  parseUrlGalleryFilters,
  isHighlightsMode,
  buildMetSearchQueryString,
} from '../lib/resolveGallerySearch';

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlState = useMemo(
    () => parseUrlGalleryFilters(searchParams),
    [searchParams]
  );

  const isHighlights = useMemo(() => isHighlightsMode(urlState), [urlState]);

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

  const resetToHighlights = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    urlState,
    isHighlights,
    metSearchQueryString,
    setFilters,
    resetToHighlights,
  };
};
