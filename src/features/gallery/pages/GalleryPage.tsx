import { useFilters } from '../hooks/useFilters';
import { useGalleryPageState } from '../hooks/useGalleryPageState';
import GalleryFiltersBar from '../components/GalleryFiltersBar';
import PaginatedArtworkGrid from '../components/PaginatedArtworkGrid';
import { GalleryStatusMessages } from '../components/GalleryStatusMessages/GalleryStatusMessages';
import { GalleryHeading } from '../components';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const { urlState } = useFilters();
  const { isHighlights, currentPage, setPage, objectIds, isPending, isError, error, isFetching } =
    useGalleryPageState(urlState);

  const showGrid = !isError && (objectIds.length > 0 || isPending);

  return (
    <div className={styles.page}>
      <GalleryHeading />
      <GalleryFiltersBar />
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
    </div>
  );
};

export default GalleryPage;