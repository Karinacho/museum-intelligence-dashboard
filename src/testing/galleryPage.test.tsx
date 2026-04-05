/**
 * Smoke: gallery shell renders when object-id and filter hooks resolve.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import GalleryPage from '@/features/gallery/pages/GalleryPage';

vi.mock(
  '@/features/gallery/components/GalleryFiltersBar/GalleryFiltersBar.tsx',
  () => ({
    default: () => <div data-testid="gallery-filters-bar">filters</div>,
  })
);

vi.mock(
  '@/features/gallery/components/PaginatedArtworkGrid/PaginatedArtworkGrid.tsx',
  () => ({
    __esModule: true,
    GALLERY_PAGE_SIZE: 20,
    default: () => <div data-testid="paginated-grid">grid</div>,
  })
);

vi.mock('@/features/gallery/hooks/useFilters', () => ({
  useFilters: () => ({
    isHighlights: false,
    urlState: { departmentId: 10 },
    objectListFilterKey: 'dept=10',
    currentPage: 1,
    setPage: vi.fn(),
  }),
}));

vi.mock('@/features/gallery/hooks/useGalleryPageState', () => ({
  useGalleryPageState: () => ({
    isHighlights: false,
    currentPage: 1,
    setPage: vi.fn(),
    objectIds: [101, 102],
    isPending: false,
    isError: false,
    error: null,
    isFetching: false,
  }),
}));

describe('Assessment — gallery page', () => {
  it('renders stats and grid when results are available', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <GalleryPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('gallery-filters-bar')).toBeInTheDocument();
    expect(screen.getByText('2 works')).toBeInTheDocument();
    expect(screen.getByTestId('paginated-grid')).toBeInTheDocument();
  });
});
