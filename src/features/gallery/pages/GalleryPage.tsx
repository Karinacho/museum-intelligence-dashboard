import { useEffect, useMemo } from 'react';
import { useFilters } from '../hooks/useFilters';
import { useSearchObjectIds } from '../hooks/useSearchObjectIds';
import { useDepartmentObjectIds } from '../hooks/useDepartmentObjectIds';
import GalleryFiltersBar from '../components/GalleryFiltersBar';
import PaginatedArtworkGrid, {
  GALLERY_PAGE_SIZE,
} from '../components/PaginatedArtworkGrid';
import { GalleryHeading } from '../components';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const {
    isHighlights: isDefaultMode,
    isDeptOnly,
    urlState,
    metSearchQueryString,
    currentPage,
    setPage,
  } = useFilters();

  const isSearchMode = !isDeptOnly;

  // Mode 1: Highlights/search mode (default highlights + filtered search)
  const {
    data: searchIds = [],
    isLoading: isLoadingSearch,
    isError: isSearchError,
    error: searchError,
    isFetching: isFetchingSearch,
  } = useSearchObjectIds(metSearchQueryString, { enabled: isSearchMode });

  // Mode 2: Department-only — uses /objects?departmentIds=X for complete results
  const {
    data: deptIds = [],
    isLoading: isLoadingDept,
    isError: isDeptError,
    error: deptError,
    isFetching: isFetchingDept,
  } = useDepartmentObjectIds(urlState.departmentId, { enabled: isDeptOnly });

  const objectIds = useMemo(() => {
    if (isDeptOnly) return deptIds;
    return searchIds;
  }, [isDeptOnly, deptIds, searchIds]);

  const isDefaultHighlights = isDefaultMode;

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

  const isLoading = isDeptOnly ? isLoadingDept : isLoadingSearch;
  const isFetching = isDeptOnly ? isFetchingDept : isFetchingSearch;
  const hasError = isDeptOnly ? isDeptError : isSearchError;
  const activeError = isDeptOnly ? deptError : searchError;

  return (
    <div className={styles.page}>
      <GalleryHeading />

      <GalleryFiltersBar />

      {hasError ? (
        <p className={styles.message} role="alert">
          {activeError instanceof Error
            ? activeError.message
            : 'Could not load search results.'}
        </p>
      ) : null}

      {isLoading && !objectIds.length ? (
        <p className={styles.message}>Loading results…</p>
      ) : null}

      {!hasError && !isLoading && objectIds.length === 0 ? (
        <p className={styles.message}>No works match these filters.</p>
      ) : null}

      {objectIds.length > 0 ? (
        <>
          <p className={styles.stats} aria-live="polite">
            {isDefaultMode
              ? 'More than 10,000 results'
              : objectIds.length > 10_000
                ? 'More than 10,000 results'
                : `${objectIds.length.toLocaleString()} works`}
          </p>
          {isDefaultHighlights && (
            <p className={styles.message} aria-live="polite">
              Showing highlighted works. Add filters to broaden or narrow the set.
            </p>
          )}
          {!isDefaultMode && isFetching ? (
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
          />
        </>
      ) : null}
    </div>
  );
};

export default GalleryPage;
