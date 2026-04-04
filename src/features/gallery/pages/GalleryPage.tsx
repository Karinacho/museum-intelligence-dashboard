import { CardSkeleton } from '@/components/ui/Card';
import Grid from '@/components/layout/Grid/Grid';

const GalleryPage = () => {
  return (
    <div>
      <h1>Gallery</h1>
      <Grid>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </Grid>
    </div>
  );
};

export default GalleryPage;
