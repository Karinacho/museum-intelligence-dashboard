import { useState, useMemo } from 'react';
import { useAllObjectIds } from './useAllObjectIds';
import { useArtworks } from './useObjectsBatch';

interface UseGalleryOptions {
  pageSize?: number;
  initialPage?: number;
}

export const useGallery = ({
  pageSize = 20,
  initialPage = 0,
}: UseGalleryOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Step 1: Fetch all object IDs (one-time, cached infinitely)
  const {
    data: allObjectIds,
    isPending: isPendingIds,
    isError: isErrorIds,
    error: errorIds,
  } = useAllObjectIds();

  // Step 2: Client-side pagination of IDs
  const currentPageIds = useMemo(() => {
    if (!allObjectIds) return [];

    const start = currentPage * pageSize;
    const end = start + pageSize;

    return allObjectIds.slice(start, end);
  }, [allObjectIds, currentPage, pageSize]);

  // Step 3: Fetch current page's object details
  const {
    artworks,
    isLoading: isLoadingArtworks,
    isError: isErrorArtworks,
    queryStates,
  } = useArtworks(currentPageIds);

  // Computed values
  const totalPages = allObjectIds
    ? Math.ceil(allObjectIds.length / pageSize)
    : 0;
  const totalObjects = allObjectIds?.length || 0;
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

  // Overall loading state
  const isInitialLoading = isPendingIds;
  const isPageLoading = isLoadingArtworks && !isPendingIds;
  const isError = isErrorIds || isErrorArtworks;

  return {
    // Data
    artworks,
    queryStates, // For skeleton loading states per card

    // Loading states
    isInitialLoading, // Show full page loader (fetching 470K IDs)
    isPageLoading, // Show skeleton cards (fetching current page details)
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
  };
};
