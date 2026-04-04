# Museum Intelligence Dashboard

## Project Structure

````
src/
├── app/
│   ├── App.tsx                  # Root component, router setup
│   ├── router.tsx               # Route definitions (React Router)
│   └── queryClient.ts           # TanStack Query client config
│
├── assets/
│   └── ...                      # Static images, fonts, etc.
│
├── components/                  # Shared/global UI components
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Spinner.tsx
│   │   ├── ErrorFallback.tsx
│   │   ├── ImageWithFallback.tsx # Handles missing images gracefully
│   │   └── Pagination.tsx
│   │
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── PageShell.tsx         # Shared page wrapper/layout
│
├── features/
│   ├── gallery/                  # Feature A: Research Gallery
│   │   ├── api/
│   │   │   └── galleryApi.ts     # searchObjects, getObjectDetails
│   │   │
│   │   ├── components/
│   │   │   ├── GalleryGrid.tsx   # Virtualized/infinite grid of cards
│   │   │   ├── ArtworkCard.tsx   # Image, Title, Artist, Date
│   │   │   └── GalleryFilters.tsx# Department, Date Range, Keyword
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSearchArtworks.ts  # Orchestrates search + batch detail fetching
│   │   │   └── useGalleryFilters.ts  # Syncs filters ↔ URL search params
│   │   │
│   │   ├── pages/
│   │   │   └── GalleryPage.tsx   # Route page, composes filters + grid
│   │   │
│   │   ├── types.ts              # GalleryFilters, ArtworkSummary
│   │   │
│   │   └── utils/
│   │       └── filterParams.ts   # Serialize/deserialize URL ↔ filter state
│   │
│   └── artifact/                 # Feature B: Artifact Analysis
│       ├── api/
│       │   └── artifactApi.ts    # getObjectById, searchRelatedWorks
│       │
│       ├── components/
│       │   ├── ArtifactDetail.tsx # Full detail card
│       │   ├── ArtifactMeta.tsx   # Accession, Medium, Dimensions, Credit
│       │   ├── TagList.tsx        # Tag chips
│       │   └── RelatedWorks.tsx   # Cross-referenced suggestions
│       │
│       ├── hooks/
│       │   ├── useArtifact.ts     # Fetches + transforms single object
│       │   └── useRelatedWorks.ts # ±50yr same-department logic
│       │
│       ├── pages/
│       │   └── ArtifactPage.tsx   # Route page /artifact/:objectId
│       │
│       ├── types.ts               # ArtifactDetail, RelatedWork
│       │
│       └── utils/
│           └── dateParser.ts      # Normalizes inconsistent date formats
│
├── lib/                          # Core shared logic (non-UI)
│   ├── api/
│   │   └── metMuseumClient.ts    # Fetch wrapper, base URL, error handling
│   │
│   ├── models/
│   │   └── artwork.ts            # Canonical internal data model + mapper
│   │
│   └── utils/
│       ├── dateUtils.ts          # BCE/CE parsing, range math
│       └── debounce.ts           # For high-frequency filter input
│
├── testing/
│   ├── mocks/
│   │   ├── handlers.ts           # MSW request handlers
│   │   ├── server.ts             # MSW server setup
│   │   └── fixtures/
│   │       ├── searchResponse.json
│   │       └── objectResponse.json
│   │
│   └── testUtils.tsx             # Custom render with providers (Router, Query)
│
├── index.css                     # Global styles / reset
└── main.tsx                      # App entry point
````
