import type { FiltersFormProps } from '../../types';
import { useDepartments } from '../../hooks';
import { urlFiltersKey } from '../../lib/urlFiltersKey';
import { GalleryFiltersFormFields } from './GalleryFiltersFormFields';

const GalleryFiltersForm = ({
  currentFilters,
  setFilters,
  resetToHighlights,
}: FiltersFormProps) => {
  const { data: departments, isPending: departmentsLoading } = useDepartments();

  return (
    <GalleryFiltersFormFields
      key={urlFiltersKey(currentFilters)}
      currentFilters={currentFilters}
      setFilters={setFilters}
      resetToHighlights={resetToHighlights}
      departments={departments}
      departmentsLoading={departmentsLoading}
    />
  );
};

export default GalleryFiltersForm;
