import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import type { ArtworkDetail } from '@/lib/models/artwork';
import type { RelatedWorksReadiness } from '@/features/artifact/lib/relatedWorks';
import ArtifactPage from '@/features/artifact/pages/ArtifactPage';

type ArtifactHookState = {
  data: ArtworkDetail | null;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

type RelatedIdsHookState = {
  data: number[];
  isPending: boolean;
  isError: boolean;
  readiness: RelatedWorksReadiness;
};

let artifactHookState: ArtifactHookState;
let relatedIdsHookState: RelatedIdsHookState;
let departmentsLoading = false;

const refetchSpy = vi.fn();

vi.mock(
  '@/features/artifact/components/RelatedWorksGrid/RelatedWorksGrid',
  () => ({
    default: ({ ids }: { ids: number[] }) => (
      <div data-testid="related-grid">{ids.join(',')}</div>
    ),
  })
);

vi.mock('@/features/artifact/hooks/useArtifactDetail', () => ({
  useArtifactDetail: () => artifactHookState,
}));

vi.mock('@/features/artifact/hooks/useRelatedWorkIds', () => ({
  useRelatedWorkIds: () => relatedIdsHookState,
}));

vi.mock('@/features/gallery/hooks/useDepartments', () => ({
  useDepartments: () => ({
    data: [{ departmentId: 11, displayName: 'European Paintings' }],
    isPending: departmentsLoading,
  }),
}));

const baseDetail = (overrides: Partial<ArtworkDetail> = {}): ArtworkDetail => ({
  id: 100,
  title: 'Study of Light',
  artist: 'Unknown artist',
  dateLine: '1890',
  structuredDate: { year: 1890, era: 'CE' },
  imageUrl: 'https://example.com/small.jpg',
  accessionNumber: 'A.190.1',
  medium: 'Oil on canvas',
  dimensions: '30 x 40 cm',
  tags: ['Portrait', 'Oil painting'],
  creditLine: 'Gift of Test Donor',
  department: 'European Paintings',
  culture: 'French',
  period: 'Modern',
  primaryImageLarge: 'https://example.com/large.jpg',
  objectBeginDate: 1888,
  objectEndDate: 1892,
  objectUrl: 'https://www.metmuseum.org/art/collection/search/100',
  ...overrides,
});

const renderArtifactRoute = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [{ path: '/artifact/:id', element: <ArtifactPage /> }],
    { initialEntries: ['/artifact/100'] }
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

describe('Assessment — artifact detail page', () => {
  it('renders required artifact metadata and related works', () => {
    artifactHookState = {
      data: baseDetail(),
      isPending: false,
      isError: false,
      error: null,
      refetch: refetchSpy,
    };
    relatedIdsHookState = {
      data: [201, 202],
      isPending: false,
      isError: false,
      readiness: {
        status: 'ok',
        departmentId: 11,
        dateBegin: 1888,
        dateEnd: 1892,
      },
    };
    departmentsLoading = false;

    renderArtifactRoute();

    expect(
      screen.getByRole('heading', { name: 'Study of Light' })
    ).toBeInTheDocument();
    expect(screen.getByText('Accession number')).toBeInTheDocument();
    expect(screen.getByText('A.190.1')).toBeInTheDocument();
    expect(screen.getByText('Oil on canvas')).toBeInTheDocument();
    expect(screen.getByText('30 x 40 cm')).toBeInTheDocument();
    expect(screen.getByText('Credit line')).toBeInTheDocument();
    expect(screen.getByText('Gift of Test Donor')).toBeInTheDocument();
    expect(screen.getByText('Portrait')).toBeInTheDocument();
    expect(screen.getByTestId('related-grid')).toHaveTextContent('201,202');
  });

  it('shows graceful fallback content for missing image and tags', () => {
    artifactHookState = {
      data: baseDetail({
        imageUrl: null,
        primaryImageLarge: null,
        tags: [],
        objectBeginDate: null,
        objectEndDate: null,
        structuredDate: null,
      }),
      isPending: false,
      isError: false,
      error: null,
      refetch: refetchSpy,
    };
    relatedIdsHookState = {
      data: [],
      isPending: false,
      isError: false,
      readiness: { status: 'no-date' },
    };
    departmentsLoading = false;

    renderArtifactRoute();

    expect(screen.getByLabelText('No image available')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No tags are listed for this object in the collection API.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'There is not enough structured date information to define a period window for suggestions.'
      )
    ).toBeInTheDocument();
  });
});
