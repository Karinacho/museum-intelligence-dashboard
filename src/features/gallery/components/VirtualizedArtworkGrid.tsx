import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueries } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Card, CardSkeleton } from '@/components/ui';
import { fetchObjectById } from '../api/galleryApi';
import { metObjectQueryKey } from '@/lib/api/metObjectQueryKey';
import { transformArtwork, type MetObjectResponse } from '@/lib/models/artwork';
import styles from './VirtualizedArtworkGrid.module.css';

const MIN_CARD_WIDTH = 260;
const ROW_GAP = 16;
const ESTIMATED_ROW_HEIGHT = 400 + ROW_GAP;
const OVERSCAN_ROWS = 2;
const INITIAL_PREFETCH_ROWS = 3;

type VirtualizedArtworkGridProps = {
  objectIds: number[];
  /** When this string changes (new search), scroll is reset to top. */
  searchKey: string;
};

const VirtualizedArtworkGrid = ({
  objectIds,
  searchKey,
}: VirtualizedArtworkGridProps) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [columnCount, setColumnCount] = useState(1);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setScrollMargin(rect.top + window.scrollY);
      const w = el.offsetWidth;
      const cols = Math.max(
        1,
        Math.floor((w + ROW_GAP) / (MIN_CARD_WIDTH + ROW_GAP))
      );
      setColumnCount(cols);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchKey]);

  const rowCount = Math.ceil(objectIds.length / columnCount) || 0;

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    scrollMargin,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const { sliceFrom, sliceTo } = useMemo(() => {
    const cols = columnCount || 1;
    const n = objectIds.length;
    if (n === 0) {
      return { sliceFrom: 0, sliceTo: -1 };
    }

    if (virtualItems.length === 0) {
      const to = Math.min(n, INITIAL_PREFETCH_ROWS * cols) - 1;
      return { sliceFrom: 0, sliceTo: Math.max(0, to) };
    }

    const firstRow = virtualItems[0].index;
    const lastRow = virtualItems[virtualItems.length - 1].index;
    let from = (firstRow - OVERSCAN_ROWS) * cols;
    let to = (lastRow + OVERSCAN_ROWS + 1) * cols - 1;
    from = Math.max(0, from);
    to = Math.min(n - 1, to);
    return { sliceFrom: from, sliceTo: to };
  }, [virtualItems, columnCount, objectIds.length]);

  const sliceIds = useMemo(() => {
    if (sliceTo < sliceFrom) return [];
    return objectIds.slice(sliceFrom, sliceTo + 1);
  }, [objectIds, sliceFrom, sliceTo]);

  const queries = useQueries({
    queries: sliceIds.map((id) => ({
      queryKey: metObjectQueryKey(id),
      queryFn: () => fetchObjectById(id),
      select: (raw: MetObjectResponse) => transformArtwork(raw),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });

  const byId = useMemo(() => {
    const m = new Map<number, (typeof queries)[number]>();
    sliceIds.forEach((id, i) => {
      m.set(id, queries[i]);
    });
    return m;
  }, [sliceIds, queries]);

  const renderCell = useCallback(
    (globalIndex: number) => {
      if (globalIndex >= objectIds.length) return null;
      const id = objectIds[globalIndex];
      const q = byId.get(id);

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
    },
    [byId, objectIds]
  );

  return (
    <div ref={measureRef} className={styles.wrapper}>
      <div
        className={styles.viewport}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            className={styles.row}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columnCount }, (_, col) => {
              const index = virtualRow.index * columnCount + col;
              return renderCell(index);
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedArtworkGrid;
