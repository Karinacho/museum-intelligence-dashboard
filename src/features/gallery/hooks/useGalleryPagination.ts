import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { GALLERY_PAGE_SIZE } from '../lib/constants';
import { gallerySafePage, galleryTotalPages } from '../lib/galleryPagination';

export function useGalleryPagination(
  objectIds: number[],
  currentPage: number,
  pageSize = GALLERY_PAGE_SIZE
) {
  const location = useLocation();
  const galleryLocation = `${location.pathname}${location.search}`;

  const totalPages = galleryTotalPages(objectIds.length, pageSize);
  const safePage = gallerySafePage(currentPage, totalPages);

  const pageIds = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return objectIds.slice(start, start + pageSize);
  }, [objectIds, safePage, pageSize]);

  const hasNextPage = safePage < totalPages;

  const nextPageIds = useMemo(() => {
    if (!hasNextPage) return [];
    const start = safePage * pageSize;
    return objectIds.slice(start, start + pageSize);
  }, [objectIds, safePage, hasNextPage, pageSize]);

  return {
    galleryLocation,
    safePage,
    pageIds,
    hasNextPage,
    nextPageIds,
  };
}
