import type { UrlGalleryFilters } from '../types';

type Draft = {
  departmentId: string;
  keyword: string;
  dateBeginInput: string;
  dateEndInput: string;
};

export function parseFiltersFromDraft(draft: Draft): UrlGalleryFilters {
  const next: UrlGalleryFilters = {};

  if (draft.departmentId !== '') {
    const id = Number.parseInt(draft.departmentId, 10);
    if (!Number.isNaN(id)) next.departmentId = id;
  }

  if (draft.keyword.trim() !== '') {
    next.keyword = draft.keyword.trim();
  }

  if (draft.dateBeginInput.trim() !== '') {
    const y = Number.parseInt(draft.dateBeginInput.trim(), 10);
    if (!Number.isNaN(y)) next.dateBegin = y;
  }
  if (draft.dateEndInput.trim() !== '') {
    const y = Number.parseInt(draft.dateEndInput.trim(), 10);
    if (!Number.isNaN(y)) next.dateEnd = y;
  }

  return next;
}
