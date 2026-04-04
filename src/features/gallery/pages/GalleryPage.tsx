import { Card, CardSkeleton } from '@/components/ui';
import Grid from '@/components/layout/Grid/Grid';
import { useGalleryWithFilters } from '../hooks/useGalleryWithFilters';
import { useGalleryFiltersFromURL } from '../hooks/useGalleryFiltersFromURL';
import { useEffect } from 'react';

const GalleryPage = () => {
  // Get filters and page from URL (supports deep linking)
  const { filters, currentPage: urlPage, setPage } = useGalleryFiltersFromURL();

  // Fetch gallery data with filters
  // Default: Highlights collection (~2K curated objects with images)
  const {
    queryStates,
    isInitialLoading,
    currentPage,
    totalPages,
    totalObjects,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage,
  } = useGalleryWithFilters({
    pageSize: 20,
    initialPage: urlPage,
    filters,
  });

  // Sync URL when page changes
  useEffect(() => {
    if (currentPage !== urlPage) {
      setPage(currentPage);
    }
  }, [currentPage, urlPage, setPage]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters, setCurrentPage]);

  // Show loading state while fetching filtered IDs (< 1 second)
  if (isInitialLoading) {
    return (
      <div>
        <h1>Gallery</h1>
        <p>Loading collection...</p>
      </div>
    );
  }

  // Show empty state if no results
  if (totalObjects === 0) {
    return (
      <div>
        <h1>Gallery</h1>
        <p>No artworks found matching your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Gallery</h1>
      <p>
        Showing {totalObjects} artworks • Page {currentPage + 1} of {totalPages}
      </p>

      {/* TODO: Add filter UI here */}
      {/* <GalleryFilters filters={filters} onFiltersChange={setFilters} /> */}

      {/* Render skeleton cards while page details are loading */}
      <Grid>
        {queryStates.map((state, index) => {
          if (state.isLoading) {
            return <CardSkeleton key={index} />;
          }

          if (state.data) {
            return (
              <Card
                key={state.data.id}
                imageSrc={state.data.imageUrl}
                name={state.data.title}
              />
            );
          }

          // Handle error or null state
          return null;
        })}
      </Grid>

      {/* Pagination controls */}
      <div>
        <button onClick={goToPreviousPage} disabled={currentPage === 0}>
          Previous
        </button>
        <span>
          {' '}
          Page {currentPage + 1} of {totalPages}{' '}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GalleryPage;
