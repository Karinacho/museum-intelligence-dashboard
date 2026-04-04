import { useState, useMemo } from 'react';
import { useSearchObjectIds } from './useSearchObjectIds';
import { useArtworks } from './useObjectsBatch';
import { type GalleryFilters, DEFAULT_GALLERY_FILTERS } from '../types/filters';

interface UseGalleryWithFiltersOptions {
  pageSize?: number;
  initialPage?: number;
  filters?: GalleryFilters;
}

/**
 * Main gallery hook with filter support
 *
 * Default behavior (no filters):
 * - Shows "Highlights" collection (~2K curated objects)
 * - All have images
 * - Fast initial load (< 1 second for IDs)
 *
 * With filters:
 * - Fetches based on department, date range, keyword
 * - Updates immediately when filters change
 * - Resets to page 0 on filter change
 *
 * Performance optimizations:
 * - IDs cached for 5 minutes per filter combination
 * - Only 20 object details fetched at a time
 * - Parallel fetching with automatic deduplication
 * - Individual object caching (1 hour)
 *
 * @param options - Configuration options for pagination and filtering
 * @returns Gallery state and controls
 */
export const useGalleryWithFilters = ({
  pageSize = 20,
  initialPage = 0,
  filters = DEFAULT_GALLERY_FILTERS,
}: UseGalleryWithFiltersOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Step 1: Fetch filtered object IDs
  const {
    data: filteredObjectIds,
    isLoading: isLoadingIds,
    isError: isErrorIds,
    error: errorIds,
  } = useSearchObjectIds(filters);

  // Step 2: Client-side pagination of IDs
  const currentPageIds = useMemo(() => {
    if (!filteredObjectIds) return [];

    const start = currentPage * pageSize;
    const end = start + pageSize;

    return filteredObjectIds.slice(start, end);
  }, [filteredObjectIds, currentPage, pageSize]);

  // Step 3: Fetch current page's object details
  const {
    artworks,
    isLoading: isLoadingArtworks,
    isError: isErrorArtworks,
    queryStates,
  } = useArtworks(currentPageIds);

  // Computed values
  const totalPages = filteredObjectIds
    ? Math.ceil(filteredObjectIds.length / pageSize)
    : 0;
  const totalObjects = filteredObjectIds?.length || 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  // Navigation functions
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 0 when filters change
  // This is handled by updating the key in the parent component

  // Overall loading state
  const isInitialLoading = isLoadingIds;
  const isPageLoading = isLoadingArtworks && !isLoadingIds;
  const isError = isErrorIds || isErrorArtworks;

  return {
    // Data
    artworks,
    queryStates,

    // Loading states
    isInitialLoading, // Fetching filtered IDs
    isPageLoading, // Fetching current page details
    isError,
    error: errorIds || null,

    // Pagination
    currentPage,
    totalPages,
    totalObjects,
    pageSize,
    hasNextPage,
    hasPreviousPage,

    // Navigation
    goToNextPage,
    goToPreviousPage,
    goToPage,
    setCurrentPage, // For external control (e.g., reset on filter change)
  };
};
