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
  const q = useQuery<MetObjectResponse, Error, PageQueryData>({
    ...galleryArtworkQueryOptions(id),
  });

  if (q.isError) {
    return (
      <div>
        <GalleryObjectErrorSlot id={id} query={q} />
      </div>
    );
  }
  if (q.isPending) {
    return (
      <div>
        <CardSkeleton />
      </div>
    );
  }
  if (!q.data?.artwork) {
    return (
      <div>
        <CardSkeleton />
      </div>
    );
  }
  const a = q.data.artwork;
  return (
    <div>
      <Card
        to={`/artifact/${a.id}`}
        state={{ from: galleryLocation }}
        name={a.title}
        artist={a.artist}
        objectDate={a.dateLine}
        imageSrc={a.imageUrl}
      />
    </div>
  );
});
