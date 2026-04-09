import { useDepartments } from '@/features/gallery/hooks';
import type { FiltersBarProps } from '../../types';
import GalleryFiltersForm from './GalleryFiltersForm/GalleryFiltersForm';
const GalleryFiltersBar = ({
  currentFilters,
  setFilters,
  resetToHighlights,
}: FiltersBarProps) => {
  const { data: departments, isPending: departmentsLoading } = useDepartments();

  return (
    <GalleryFiltersForm
      currentFilters={currentFilters}
      departments={departments}
      departmentsLoading={departmentsLoading}
      setFilters={setFilters}
      resetToHighlights={resetToHighlights}
    />
  );
};

export default GalleryFiltersBar;
