import { CardSkeleton } from '@/components/ui';
import Grid from '@/components/layout/Grid/Grid.tsx';
import { GALLERY_PAGE_SIZE } from '../../lib/constants.ts';
import { GalleryPaginationNav } from './GalleryPaginationNav';
import styles from './PaginatedArtworkGrid.module.css';

export function GalleryArtworkGridLoading() {
  return (
    <div className={styles.wrap}>
      <Grid>
        {Array.from({ length: GALLERY_PAGE_SIZE }, (_, i) => (
          <div key={`ids-loading-${i}`}>
            <CardSkeleton />
          </div>
        ))}
      </Grid>
      <GalleryPaginationNav variant="loading" />
    </div>
  );
}
