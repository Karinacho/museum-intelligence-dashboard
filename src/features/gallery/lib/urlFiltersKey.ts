import type { UrlGalleryFilters } from '../types';

/** Stable key: changes iff URL-backed filter fields change (for remounting draft state). */
export function urlFiltersKey(filters: UrlGalleryFilters): string {
  return [
    filters.departmentId ?? '',
    filters.keyword ?? '',
    filters.dateBegin ?? '',
    filters.dateEnd ?? '',
  ].join('\0');
}