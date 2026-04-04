import { useEffect, useMemo } from 'react';
import { useFilters } from '../hooks/useFilters';
import { useSearchObjectIds } from '../hooks/useSearchObjectIds';
import GalleryFiltersBar from '../components/GalleryFiltersBar';
import PaginatedArtworkGrid, {
  GALLERY_PAGE_SIZE,
} from '../components/PaginatedArtworkGrid';
import styles from './GalleryPage.module.css';
import {useAllObjectIds} from "@/features/gallery/hooks/useAllObjectIds.ts";
import { GalleryHeading } from "../components";

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

  const {
    data: allData = []
  } = useAllObjectIds();

  console.log(allData);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(allData.length / GALLERY_PAGE_SIZE)),
    [allData.length]
  );

  useEffect(() => {
    if (allData.length === 0) return;
    if (currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [allData.length, currentPage, totalPages, setPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className={styles.page}>
      <GalleryHeading />

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
