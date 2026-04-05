import { useEffect, useMemo } from 'react';
import { useFilters } from '../hooks/useFilters';
import { useGalleryObjectIds } from '../hooks/useGalleryObjectIds';
import GalleryFiltersBar from '../components/GalleryFiltersBar';
import PaginatedArtworkGrid, {
  GALLERY_PAGE_SIZE,
} from '../components/PaginatedArtworkGrid';
import { GalleryHeading } from '../components';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const {
    isHighlights,
    isDeptOnly,
    urlState,
    objectListFilterKey,
    currentPage,
    setPage,
  } = useFilters();

  const {
    data: objectIds = [],
    isLoading,
    isError,
    error,
    isFetching,
  } = useGalleryObjectIds(urlState, objectListFilterKey);


  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(objectIds.length / GALLERY_PAGE_SIZE)),
    [objectIds.length]
  );

  useEffect(() => {
    if (objectIds.length === 0) return;
    if (currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [objectIds.length, currentPage, totalPages, setPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);


  const filterDatesOnClient =
    isDeptOnly &&
    (urlState.dateBegin !== undefined || urlState.dateEnd !== undefined);

  return (
    <div className={styles.page}>
      <GalleryHeading />

      <GalleryFiltersBar />
  

      {isError ? (
        <p className={styles.message} role="alert">
          {error instanceof Error
            ? error.message
            : 'Could not load search results.'}
        </p>
      ) : null}

      {isLoading && !objectIds.length ? (
        <p className={styles.message}>Loading results…</p>
      ) : null}

      {!isError && !isLoading && objectIds.length === 0 ? (
        <p className={styles.message}>No works match these filters.</p>
      ) : null}

      {objectIds.length > 0 ? (
        <>
          <p className={styles.stats} aria-live="polite">
            {isHighlights
              ? 'More than 10,000 results'
              : objectIds.length > 10_000
                ? 'More than 10,000 results'
                : `${objectIds.length.toLocaleString()} works`}
          </p>
          {isHighlights && (
            <p className={styles.message} aria-live="polite">
              Showing highlighted works. Add filters to broaden or narrow the set.
            </p>
          )}
          {!isHighlights && isFetching ? (
            <p className={styles.message} aria-live="polite">
              Updating results…
            </p>
          ) : null}
          <PaginatedArtworkGrid
            objectIds={objectIds}
            page={currentPage}
            onPageChange={setPage}
            dateBegin={urlState.dateBegin}
            dateEnd={urlState.dateEnd}
            filterDatesOnClient={filterDatesOnClient}
          />
        </>
      ) : null}
    </div>
  );
};

export default GalleryPage;
