import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import GalleryFiltersBar from './GalleryFiltersBar';

vi.mock('../hooks/useDepartments', () => ({
  useDepartments: () => ({
    data: [
      { departmentId: 10, displayName: 'Egyptian Art' },
      { departmentId: 11, displayName: 'European Paintings' },
    ],
    isLoading: false,
  }),
}));

describe('GalleryFiltersBar', () => {
  const renderWithProviders = (router: ReturnType<typeof createMemoryRouter>) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  };

  it('writes keyword and department into the URL when searching', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <GalleryFiltersBar />,
        },
      ],
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

  it('clears filters when showing highlights', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <GalleryFiltersBar />,
        },
      ],
      { initialEntries: ['/?keyword=old'] }
    );

    renderWithProviders(router);
    await user.click(screen.getByRole('button', { name: /show highlights/i }));

    expect(router.state.location.search).toBe('');
  });
});
