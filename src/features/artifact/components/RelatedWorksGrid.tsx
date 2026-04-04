import { useQueries } from '@tanstack/react-query';
import { Card, CardSkeleton } from '@/components/ui';
import { fetchObjectById } from '@/features/gallery/api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import { transformArtwork, type MetObjectResponse } from '@/lib/models/artwork';
import styles from './RelatedWorksGrid.module.css';

type RelatedWorksGridProps = {
  ids: number[];
};

const RelatedWorksGrid = ({ ids }: RelatedWorksGridProps) => {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: metObjectQueryKey(id),
      queryFn: () => fetchObjectById(id),
      select: (raw: MetObjectResponse) => transformArtwork(raw),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });

  return (
    <div className={styles.grid}>
      {ids.map((id, i) => {
        const q = queries[i];
        if (!q || q.isLoading) {
          return (
            <div key={id} className={styles.cell}>
              <CardSkeleton />
            </div>
          );
        }
        if (q.isError || !q.data) {
          return (
            <div key={id} className={styles.cell}>
              <Card
                name="Unavailable"
                artist={null}
                objectDate={null}
                imageSrc={null}
              />
            </div>
          );
        }
        const a = q.data;
        return (
          <div key={id} className={styles.cell}>
            <Card
              to={`/artifact/${a.id}`}
              name={a.title}
              artist={a.artist}
              objectDate={a.dateLine}
              imageSrc={a.imageUrl}
            />
          </div>
        );
      })}
    </div>
  );
};

export default RelatedWorksGrid;
