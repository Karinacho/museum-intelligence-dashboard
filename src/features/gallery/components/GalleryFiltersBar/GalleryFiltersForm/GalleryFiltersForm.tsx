import type { FiltersBarProps } from '../../../types';
import { useDepartments } from '../../../hooks';
import styles from './GalleryFiltersForm.module.css';
import { useGalleryFiltersDraft } from '../../../hooks';
import { DateRangeField } from './DateRangeField';
import { DepartmentField } from './DepartmentField';
import { FiltersActions } from './FiltersActions';
import { KeywordField } from './KeywordField';

const GalleryFiltersForm = ({
  currentFilters,
  setFilters,
  resetToHighlights,
}: FiltersBarProps) => {
  const { data: departments, isPending: departmentsLoading } = useDepartments();
  const {
    departmentId,
    setDepartmentId,
    keyword,
    setKeyword,
    dateBeginInput,
    setDateBeginInput,
    dateEndInput,
    setDateEndInput,
    applyFilters,
  } = useGalleryFiltersDraft(currentFilters, setFilters);

  return (
    <section className={styles.bar} aria-label="Search and filters">
      <div className={styles.row}>
        <DepartmentField
          value={departmentId}
          onChange={setDepartmentId}
          departments={departments}
          disabled={departmentsLoading}
        />
        <KeywordField
          value={keyword}
          onChange={setKeyword}
          onSubmit={applyFilters}
        />
      </div>
      <DateRangeField
        dateBeginInput={dateBeginInput}
        dateEndInput={dateEndInput}
        onDateBeginChange={setDateBeginInput}
        onDateEndChange={setDateEndInput}
        onSubmit={applyFilters}
      />
      <FiltersActions
        onSearch={applyFilters}
        onReset={resetToHighlights}
        searchDisabled={departmentsLoading}
      />
    </section>
  );
};

export default GalleryFiltersForm;
