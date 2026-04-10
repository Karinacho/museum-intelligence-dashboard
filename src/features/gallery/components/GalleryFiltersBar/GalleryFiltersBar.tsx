import type { FiltersBarProps } from '../../types';
import GalleryFiltersForm from './GalleryFiltersForm/GalleryFiltersForm';
const GalleryFiltersBar = ({
  currentFilters,
  setFilters,
  resetToHighlights,
}: FiltersBarProps) => {

  return (
    <GalleryFiltersForm
      currentFilters={currentFilters}
      setFilters={setFilters}
      resetToHighlights={resetToHighlights}
    />
  );
};

export default GalleryFiltersBar;
