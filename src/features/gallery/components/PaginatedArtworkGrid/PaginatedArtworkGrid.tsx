import Grid from '@/components/layout/Grid/Grid.tsx';
import type { PaginatedArtworkGridProps } from '../../types';
import { useGalleryPagination } from '../../hooks/useGalleryPagination';
import { usePrefetchGalleryNextPage } from '../../hooks/usePrefetchGalleryNextPage';
import { GalleryArtworkSlot } from '../GalleryArtworkSlot/GalleryArtworkSlot';
import { GalleryArtworkGridLoading } from './GalleryArtworkGridLoading';
import { GalleryPaginationNav } from './GalleryPaginationNav';
import styles from './PaginatedArtworkGrid.module.css';

const PaginatedArtworkGrid = ({
  objectIds,
  currentPage,
  onPageChange,
  idsLoading = false,
}: PaginatedArtworkGridProps) => {
  const { galleryLocation, safePage, pageIds, hasNextPage, nextPageIds } =
    useGalleryPagination(objectIds, currentPage);
  usePrefetchGalleryNextPage(nextPageIds, idsLoading);

  if (idsLoading) {
    return <GalleryArtworkGridLoading />;
  }

  return (
    <div className={styles.wrap}>
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
