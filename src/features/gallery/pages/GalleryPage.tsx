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
    urlState,
    objectListFilterKey,
    currentPage,
    setPage,
  } = useFilters();

  const {
    data: objectIds = [],
    isPending: objectIdsPending,
    isError,
    error,
    isFetching,
  } = useGalleryObjectIds(urlState);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(objectIds.length / GALLERY_PAGE_SIZE)),
    [objectIds.length]
  );

  const showCrossCollectionDateNote = useMemo(
    () =>
      urlState.departmentId === undefined &&
      (urlState.dateBegin !== undefined || urlState.dateEnd !== undefined),
    [urlState.departmentId, urlState.dateBegin, urlState.dateEnd]
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

      {objectIdsPending && !objectIds.length ? (
        <p className={styles.message}>Loading results…</p>
      ) : null}

      {!isError && !objectIdsPending && objectIds.length === 0 ? (
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
          {showCrossCollectionDateNote ? (
            <p className={styles.message} aria-live="polite">
              Date filters without a department use the museum search API, which returns a
              limited set of matches—not the full online collection.
            </p>
          ) : null}
          {!isHighlights && isFetching ? (
            <p className={styles.message} aria-live="polite">
              Updating results…
            </p>
          ) : null}
          <PaginatedArtworkGrid
            key={`${objectListFilterKey}::p${currentPage}`}
            objectIds={objectIds}
            page={currentPage}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  );
};

export default GalleryPage;
