import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardSkeleton } from '@/components/ui';
import type { MetObjectResponse } from '@/lib/models/artwork';
import { galleryArtworkQueryOptions } from '@/features/gallery/lib/galleryArtworkQueryOptions';
import { GalleryObjectErrorSlot } from '../GalleryObjectErrorSlot/GalleryObjectErrorSlot';
import type { PageQueryData } from '../../types';

type GalleryArtworkSlotProps = {
  id: number;
  galleryLocation: string;
};

export const GalleryArtworkSlot = memo(function GalleryArtworkSlot({
  id,
  galleryLocation,
}: GalleryArtworkSlotProps) {
  const singleArtworkQuery = useQuery<MetObjectResponse, Error, PageQueryData>({
    ...galleryArtworkQueryOptions(id),
  });

  if (singleArtworkQuery.isError) {
    return (
      <div>
        <GalleryObjectErrorSlot id={id} query={singleArtworkQuery} />
      </div>
    );
  }
  if (singleArtworkQuery.isPending || !singleArtworkQuery.data?.artwork ) {
    return (
      <div>
        <CardSkeleton />
      </div>
    );
  }

  const currentArtwork = singleArtworkQuery.data.artwork;
  
  return (
    <div>
      <Card
        to={`/artifact/${currentArtwork.id}`}
        state={{ from: galleryLocation }}
        name={currentArtwork.title}
        artist={currentArtwork.artist}
        objectDate={currentArtwork.dateLine}
        imageSrc={currentArtwork.imageUrl}
      />
    </div>
  );
});
