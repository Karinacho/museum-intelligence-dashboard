import { useGalleryPageState } from '../hooks';
import {
  GalleryHeading,
  GalleryFiltersBar,
  PaginatedArtworkGrid,
  GalleryStatusMessages,
} from '../components';

const GalleryPage = () => {
  const {
    isHighlights,
    currentPage,
    setPage,
    objectIds,
    isPending,
    isError,
    error,
    isFetching,
    setFilters,
    resetToHighlights,
    currentFilters,
  } = useGalleryPageState();

  const showGrid = !isError && (objectIds.length > 0 || isPending);

  return (
    <>
      <GalleryHeading />
      <GalleryFiltersBar
        currentFilters={currentFilters}
        setFilters={setFilters}
        resetToHighlights={resetToHighlights}
      />
      <GalleryStatusMessages
        isError={isError}
        error={error}
        isPending={isPending}
        isFetching={isFetching}
        isHighlights={isHighlights}
        resultCount={objectIds.length}
      />
      {showGrid && (
        <PaginatedArtworkGrid
          objectIds={objectIds}
          page={currentPage}
          onPageChange={setPage}
          idsLoading={isPending && !objectIds.length}
        />
      )}
    </>
  );
};

export default GalleryPage;
