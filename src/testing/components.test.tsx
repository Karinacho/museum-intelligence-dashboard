/**
 * Assessment: UI behavior driven by filters, routing, and async queries.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import { metClient } from '@/lib/api/metMuseumClient';
import GalleryFiltersBar from '@/features/gallery/components/GalleryFiltersBar';
import RelatedWorksGrid from '@/features/artifact/components/RelatedWorksGrid';
import { metObjectResponseMinimal } from '@/testing/fixtures/metObject';

vi.mock('@/features/gallery/hooks/useDepartments', () => ({
  useDepartments: () => ({
    data: [
      { departmentId: 10, displayName: 'Egyptian Art' },
      { departmentId: 11, displayName: 'European Paintings' },
    ],
    isPending: false,
  }),
}));

describe('Assessment — component logic', () => {
  describe('GalleryFiltersBar', () => {
    const renderWithProviders = (
      router: ReturnType<typeof createMemoryRouter>
    ) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return render(
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    };

    it('applies department and keyword to the URL on search', async () => {
      const user = userEvent.setup();
      const router = createMemoryRouter(
        [{ path: '/', element: <GalleryFiltersBar /> }],
        { initialEntries: ['/'] }
      );

      renderWithProviders(router);

      await user.selectOptions(screen.getByLabelText(/department/i), '10');
      await user.type(screen.getByLabelText(/keyword/i), 'scarab');
      await user.click(screen.getByRole('button', { name: /search collection/i }));

      const search = new URLSearchParams(router.state.location.search);
      expect(search.get('dept')).toBe('10');
      expect(search.get('keyword')).toBe('scarab');
    });

    it('resets URL to highlights when requested', async () => {
      const user = userEvent.setup();
      const router = createMemoryRouter(
        [{ path: '/', element: <GalleryFiltersBar /> }],
        { initialEntries: ['/?keyword=old'] }
      );

      renderWithProviders(router);
      await user.click(screen.getByRole('button', { name: /show highlights/i }));

      expect(router.state.location.search).toBe('');
    });

    it('restores form controls from URL query params on mount', () => {
      const router = createMemoryRouter(
        [{ path: '/', element: <GalleryFiltersBar /> }],
        {
          initialEntries: [
            '/?dept=11&keyword=statue',
          ],
        }
      );

      renderWithProviders(router);

      expect(screen.getByLabelText(/department/i)).toHaveValue('11');
      expect(screen.getByLabelText(/keyword/i)).toHaveValue('statue');
    });

    it('applies date range to the URL on search', async () => {
      const user = userEvent.setup();
      const router = createMemoryRouter(
        [{ path: '/', element: <GalleryFiltersBar /> }],
        { initialEntries: ['/'] }
      );

      renderWithProviders(router);

      await user.type(screen.getByLabelText(/^from year/i), '1800');
      await user.type(screen.getByLabelText(/^to year/i), '1900');
      await user.click(screen.getByRole('button', { name: /search collection/i }));

      const search = new URLSearchParams(router.state.location.search);
      expect(search.get('dateBegin')).toBe('1800');
      expect(search.get('dateEnd')).toBe('1900');
      expect(search.get('all')).toBe('1');
    });

    it('debounces keyword into the URL after a pause', async () => {
      const user = userEvent.setup();
      const router = createMemoryRouter(
        [{ path: '/', element: <GalleryFiltersBar /> }],
        { initialEntries: ['/'] }
      );

      renderWithProviders(router);

      await user.type(screen.getByLabelText(/keyword/i), 'ab');
      expect(
        new URLSearchParams(router.state.location.search).get('keyword')
      ).toBeNull();

      await waitFor(
        () => {
          expect(
            new URLSearchParams(router.state.location.search).get('keyword')
          ).toBe('ab');
        },
        { timeout: 1500 }
      );
    });
  });

  describe('RelatedWorksGrid', () => {
    it('loads each related object and renders card titles', async () => {
      const getSpy = vi.spyOn(metClient, 'get');
      getSpy.mockImplementation(async (endpoint: string) => {
        if (endpoint === '/objects/201') {
          return metObjectResponseMinimal({
            objectID: 201,
            title: 'Related Alpha',
          });
        }
        if (endpoint === '/objects/202') {
          return metObjectResponseMinimal({
            objectID: 202,
            title: 'Related Beta',
          });
        }
        throw new Error(`unexpected ${endpoint}`);
      });

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RelatedWorksGrid ids={[201, 202]} />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Related Alpha' })
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole('heading', { name: 'Related Beta' })
      ).toBeInTheDocument();

      getSpy.mockRestore();
    });
  });
});
