import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    queueMicrotask(() => {
      setDepartmentId(
        currentFilters.departmentId != null
          ? String(currentFilters.departmentId)
          : ''
      );
      setKeyword(currentFilters.keyword ?? '');
      setDateBeginInput(
        currentFilters.dateBegin != null ? String(currentFilters.dateBegin) : ''
      );
      setDateEndInput(
        currentFilters.dateEnd != null ? String(currentFilters.dateEnd) : ''
      );
    });
  }, [
    currentFilters.departmentId,
    currentFilters.keyword,
    currentFilters.dateBegin,
    currentFilters.dateEnd,
  ]);

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
