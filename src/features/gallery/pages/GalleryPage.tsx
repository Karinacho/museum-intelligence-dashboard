import { Card, CardSkeleton } from '@/components/ui/Card';
import Grid from '@/components/layout/Grid/Grid';
import { useGallery } from '../hooks/useGallery';

const GalleryPage = () => {
  // This automatically fetches all 470K IDs on mount
  const {
    artworks,
    queryStates,
    isInitialLoading,
    isPageLoading,
    currentPage,
    totalPages,
    totalObjects,
    goToNextPage,
    goToPreviousPage,
  } = useGallery({ pageSize: 20 });

  // Show loading state while fetching all IDs (2-5 seconds)
  if (isInitialLoading) {
    return (
      <div>
        <h1>Gallery</h1>
        <p>Loading gallery database ({totalObjects} objects)...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Gallery</h1>
      <p>
        Page {currentPage + 1} of {totalPages}
      </p>

      {/* Render skeleton cards while page details are loading */}
      <Grid>
        {queryStates.map((state, index) => {
          if (state.isLoading) {
            return <CardSkeleton key={index} />;
          }

          if (state.data) {
            return (
              <Card imageSrc={state?.data?.imageUrl} name={state.data.title} />
              // <div key={state.data.id}>
              //   <h3>{state.data.title}</h3>
              //   <p>{state.data.artist}</p>
              //   <p>{state.data.date}</p>
              //   {state.data.imageUrl && (
              //     <img src={state.data.imageUrl} alt={state.data.title} />
              //   )}
              // </div>
            );
          }

          // Handle error or null state
          return null;
        })}
      </Grid>

      {/* Pagination controls */}
      <div>
        <button onClick={goToPreviousPage} disabled={currentPage === 0}>
          Previous
        </button>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GalleryPage;
