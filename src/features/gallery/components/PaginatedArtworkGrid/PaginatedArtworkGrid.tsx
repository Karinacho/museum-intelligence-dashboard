import Grid from '@/components/layout/Grid/Grid.tsx';
import type { PaginatedArtworkGridProps } from '../../types';
import { useGalleryPagination } from '../../hooks/useGalleryPagination';
import { useGalleryRateLimitBanner } from '../../hooks/useGalleryRateLimitBanner';
import { usePrefetchGalleryNextPage } from '../../hooks/usePrefetchGalleryNextPage';
import { GalleryArtworkSlot } from '../GalleryArtworkSlot/GalleryArtworkSlot';
import { GalleryArtworkGridLoading } from './GalleryArtworkGridLoading';
import { GalleryPaginationNav } from './GalleryPaginationNav';
import { GalleryRateLimitBanner } from './GalleryRateLimitBanner';
import styles from './PaginatedArtworkGrid.module.css';

const PaginatedArtworkGrid = ({
  objectIds,
  page,
  onPageChange,
  idsLoading = false,
}: PaginatedArtworkGridProps) => {
  const { galleryLocation, safePage, pageIds, hasNextPage, nextPageIds } =
    useGalleryPagination(objectIds, page);

  const showRateBanner = useGalleryRateLimitBanner(pageIds, idsLoading);
  usePrefetchGalleryNextPage(nextPageIds, idsLoading);

  if (idsLoading) {
    return <GalleryArtworkGridLoading />;
  }

  return (
    <div className={styles.wrap}>
      {showRateBanner ? <GalleryRateLimitBanner /> : null}
      <Grid>
        {pageIds.map((id) => (
          <GalleryArtworkSlot
            key={id}
            id={id}
            galleryLocation={galleryLocation}
          />
        ))}
      </Grid>

      <GalleryPaginationNav
        variant="ready"
        safePage={safePage}
        hasNextPage={hasNextPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default PaginatedArtworkGrid;
