import type { UrlGalleryFilters } from '../types';

type Draft = {
  departmentId: string;
  keyword: string;
  dateBeginInput: string;
  dateEndInput: string;
};

export function buildFiltersFromDraft(d: Draft): UrlGalleryFilters {
  const next: UrlGalleryFilters = {};

  if (d.departmentId !== '') {
    const id = Number.parseInt(d.departmentId, 10);
    if (!Number.isNaN(id)) next.departmentId = id;
  }

  if (d.keyword.trim() !== '') {
    next.keyword = d.keyword.trim();
  }

  if (d.dateBeginInput.trim() !== '') {
    const y = Number.parseInt(d.dateBeginInput.trim(), 10);
    if (!Number.isNaN(y)) next.dateBegin = y;
  }
  if (d.dateEndInput.trim() !== '') {
    const y = Number.parseInt(d.dateEndInput.trim(), 10);
    if (!Number.isNaN(y)) next.dateEnd = y;
  }

  return next;
}
