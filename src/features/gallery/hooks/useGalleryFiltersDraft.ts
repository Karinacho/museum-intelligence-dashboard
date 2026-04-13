import { useCallback, useState } from 'react';
import { parseFiltersFromDraft } from '../lib/parseFiltersFromDraft';
import type { UrlGalleryFilters } from '../types';

export function useGalleryFiltersDraft(
  currentFilters: UrlGalleryFilters,
  setFilters: (next: UrlGalleryFilters) => void
) {
  const [departmentId, setDepartmentId] = useState(() =>
    currentFilters.departmentId != null
      ? String(currentFilters.departmentId)
      : ''
  );

  const [keyword, setKeyword] = useState(() => currentFilters.keyword ?? '');
  const [dateBeginInput, setDateBeginInput] = useState(() =>
    currentFilters.dateBegin != null ? String(currentFilters.dateBegin) : ''
  );
  const [dateEndInput, setDateEndInput] = useState(() =>
    currentFilters.dateEnd != null ? String(currentFilters.dateEnd) : ''
  );

  const applyFilters = useCallback(() => {
    setFilters(
      parseFiltersFromDraft({
        departmentId,
        keyword,
        dateBeginInput,
        dateEndInput,
      })
    );
  }, [setFilters, departmentId, keyword, dateBeginInput, dateEndInput]);

  return {
    departmentId,
    setDepartmentId,
    keyword,
    setKeyword,
    dateBeginInput,
    setDateBeginInput,
    dateEndInput,
    setDateEndInput,
    applyFilters,
  };
}
