import { useEffect, useMemo } from 'react';
import { useFilters } from '../hooks/useFilters';
import { useSearchObjectIds } from '../hooks/useSearchObjectIds';
import GalleryFiltersBar from '../components/GalleryFiltersBar';
import PaginatedArtworkGrid, {
  GALLERY_PAGE_SIZE,
} from '../components/PaginatedArtworkGrid';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const { isHighlights, metSearchQueryString, currentPage, setPage } =
    useFilters();
  const {
    data: objectIds = [],
    isLoading: isLoadingIds,
    isError: isSearchError,
    error: searchError,
    isFetching,
  } = useSearchObjectIds(metSearchQueryString);

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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Research gallery</h1>
          {isHighlights ? (
            <span className={styles.badge}>Highlights</span>
          ) : null}
        </div>
        <p className={styles.subtitle}>
          Curated discovery across The Met collection. Refine by department,
          date, and keyword; every search is reflected in the URL for sharing
          and reload.
        </p>
      </header>

      <GalleryFiltersBar />

      {isSearchError ? (
        <p className={styles.message} role="alert">
          {searchError instanceof Error
            ? searchError.message
            : 'Could not load search results.'}
        </p>
      ) : null}

      {isLoadingIds && !objectIds.length ? (
        <p className={styles.message}>Loading results…</p>
      ) : null}

      {!isSearchError && !isLoadingIds && objectIds.length === 0 ? (
        <p className={styles.message}>No works match these filters.</p>
      ) : null}

      {objectIds.length > 0 ? (
        <>
          <p className={styles.stats} aria-live="polite">
            {objectIds.length.toLocaleString()} works
            {isFetching && !isLoadingIds ? ' · updating…' : ''}
          </p>
          <PaginatedArtworkGrid
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
