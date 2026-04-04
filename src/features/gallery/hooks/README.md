# Gallery Hooks - Usage Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      useGallery Hook                        │
│                                                             │
│  ┌───────────────────┐         ┌────────────────────────┐  │
│  │ useAllObjectIds   │────────▶│  Client-side Pagination │  │
│  │ (470K IDs)        │         │  (Slice 20 IDs)        │  │
│  │ • Fetch once      │         └────────────────────────┘  │
│  │ • Cache ∞         │                    │                │
│  └───────────────────┘                    ▼                │
│                                  ┌────────────────────────┐  │
│                                  │  useObjectsBatch       │  │
│                                  │  (Fetch 20 details)    │  │
│                                  │  • Parallel requests   │  │
│                                  │  • Deduplication       │  │
│                                  │  • Cache 1hr           │  │
│                                  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Basic Usage

```typescript
import { useGallery } from '@/features/gallery/hooks/useGallery';

function GalleryPage() {
  const {
    artworks,
    queryStates,
    isInitialLoading,
    isPageLoading,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
  } = useGallery({ pageSize: 20 });

  // Initial load: Fetching 470K IDs (2-5 seconds)
  if (isInitialLoading) {
    return <div>Loading gallery database...</div>;
  }

  return (
    <div>
      {/* Render artworks as they load */}
      <div className="grid">
        {queryStates.map((state, index) => (
          <div key={index}>
            {state.isLoading && <SkeletonCard />}
            {state.data && <ArtworkCard artwork={state.data} />}
            {state.isError && <ErrorCard />}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={goToNextPage}
        onPrevious={goToPreviousPage}
      />
    </div>
  );
}
```

## Performance Characteristics

### Initial Load (First Visit)
```
Time: 2-5 seconds
Network: 1 request (~3-4 MB)
Action: Fetch /objects (470K IDs)
Result: All IDs cached in memory
```

### Page Navigation (After Initial Load)
```
Time: 0.5-1.5 seconds
Network: ~20 requests (parallel, ~10KB each)
Action: Fetch /objects/{id} for each ID
Result: Progressive rendering as data arrives
```

### Revisiting a Page
```
Time: Instant
Network: 0 requests
Action: Load from cache
Result: Immediate render
```

## Advanced Usage - Infinite Scroll

```typescript
function GalleryPage() {
  const {
    artworks,
    queryStates,
    hasNextPage,
    goToNextPage,
    isPageLoading,
  } = useGallery({ pageSize: 20 });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isPageLoading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          goToNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isPageLoading, hasNextPage, goToNextPage]
  );

  return (
    <div>
      {/* Artwork grid */}
      <div className="grid">
        {queryStates.map((state, index) => (
          // ... render cards
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && <div ref={loadMoreRef}>Loading more...</div>}
    </div>
  );
}
```

## URL State Sync (Deep Linking)

```typescript
import { useSearchParams } from 'react-router-dom';

function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get('page')) || 0;

  const { artworks, currentPage, goToPage } = useGallery({
    initialPage: pageFromUrl,
  });

  // Sync URL when page changes
  useEffect(() => {
    setSearchParams({ page: String(currentPage) });
  }, [currentPage, setSearchParams]);

  // ...
}
```

## Memory Optimization (Optional)

If 470K IDs (~2MB) is too much memory:

```typescript
// Option 1: Use sessionStorage
const useAllObjectIds = () => {
  return useQuery({
    queryKey: ['objects', 'all'],
    queryFn: async () => {
      const cached = sessionStorage.getItem('met_object_ids');
      if (cached) return JSON.parse(cached);

      const ids = await fetchAllObjectIds();
      sessionStorage.setItem('met_object_ids', JSON.stringify(ids));
      return ids;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

// Option 2: Fetch only specific department
const fetchDepartmentIds = async (departmentId: number) => {
  const response = await metClient.get<MetObjectsResponse>(
    `/objects?departmentIds=${departmentId}`
  );
  return response.objectIDs;
};
```

## Testing

```typescript
// Mock useGallery in tests
import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/providers/queryClient';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

test('useGallery fetches and paginates', async () => {
  const { result } = renderHook(() => useGallery(), { wrapper });

  await waitFor(() => {
    expect(result.current.isInitialLoading).toBe(false);
  });

  expect(result.current.artworks).toHaveLength(20);
  expect(result.current.currentPage).toBe(0);
});
```

## Key Benefits

✅ **One-time cost**: 470K IDs fetched once, cached forever
✅ **Non-blocking UI**: Only 20 objects fetched at a time
✅ **Parallel loading**: TanStack Query handles concurrency
✅ **Request deduplication**: Same ID never fetched twice
✅ **Progressive rendering**: Cards appear as data arrives
✅ **Instant navigation**: Revisiting pages uses cache
✅ **URL deep-linking**: Share specific page states
✅ **Error resilience**: Failed fetches don't break UI
