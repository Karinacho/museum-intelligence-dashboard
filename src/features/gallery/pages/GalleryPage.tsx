import { useEffect, useMemo } from 'react';
import { useFilters } from '../hooks/useFilters';
import { useSearchObjectIds } from '../hooks/useSearchObjectIds';
import { useAllObjectIds } from '@/features/gallery/hooks/useAllObjectIds';
import { SEED_OBJECT_IDS } from '../data/seedObjectIds';
import GalleryFiltersBar from '../components/GalleryFiltersBar';
import PaginatedArtworkGrid, {
  GALLERY_PAGE_SIZE,
} from '../components/PaginatedArtworkGrid';
import { GalleryHeading } from '../components';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const { isHighlights: isDefaultMode, metSearchQueryString, currentPage, setPage } =
    useFilters();

  // Filtered search — only fires when the user has applied filters
  const {
    data: searchIds = [],
    isLoading: isLoadingSearch,
    isError: isSearchError,
    error: searchError,
    isFetching: isFetchingSearch,
  } = useSearchObjectIds(metSearchQueryString, { enabled: !isDefaultMode });

  // Full collection list — prefetched at app mount, resolves in background
  const {
    data: allObjectIds,
    isLoading: isLoadingAll,
  } = useAllObjectIds();

  // Two-phase ID source:
  //  Default mode → seed IDs immediately, swap to full list once available
  //  Filtered mode → search results
  const objectIds = useMemo(() => {
    if (!isDefaultMode) return searchIds;
    if (allObjectIds && allObjectIds.length > 0) return allObjectIds;
    return SEED_OBJECT_IDS as unknown as number[];
  }, [isDefaultMode, searchIds, allObjectIds]);

  const isUsingFullList = isDefaultMode && allObjectIds != null && allObjectIds.length > 0;
  const isUsingSeed = isDefaultMode && !isUsingFullList;

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

  const isLoading = isDefaultMode ? false : isLoadingSearch;
  const isFetching = isDefaultMode ? isLoadingAll : isFetchingSearch;

  return (
    <div className={styles.page}>
      <GalleryHeading />

      <GalleryFiltersBar />

      {isSearchError && !isDefaultMode ? (
        <p className={styles.message} role="alert">
          {searchError instanceof Error
            ? searchError.message
            : 'Could not load search results.'}
        </p>
      ) : null}

      {isLoading && !objectIds.length ? (
        <p className={styles.message}>Loading results…</p>
      ) : null}

      {!isSearchError && !isLoading && objectIds.length === 0 ? (
        <p className={styles.message}>No works match these filters.</p>
      ) : null}

      {objectIds.length > 0 ? (
        <>
          <p className={styles.stats} aria-live="polite">
            {isUsingSeed
              ? `${SEED_OBJECT_IDS.length.toLocaleString()} featured works`
              : `${objectIds.length.toLocaleString()} works`}
            {isFetching ? ' · loading full collection…' : ''}
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
