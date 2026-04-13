import { GALLERY_PAGE_SIZE } from './constants';

/** Total page count for a 1-based gallery; at least 1 page even when empty. */
export function galleryTotalPages(
  objectCount: number,
  pageSize: number = GALLERY_PAGE_SIZE
): number {
  return Math.max(1, Math.ceil(objectCount / pageSize));
}

/** Clamp 1-based page index to [1, totalPages] (inclusive). */
export function gallerySafePage(currentPage: number, totalPages: number): number {
  return Math.min(Math.max(1, currentPage), totalPages);
}
