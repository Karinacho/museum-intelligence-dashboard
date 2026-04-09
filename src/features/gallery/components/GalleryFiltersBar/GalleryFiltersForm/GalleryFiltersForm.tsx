import type { FiltersFormProps } from '../../../types';

import styles from './GalleryFiltersForm.module.css';
import { useGalleryFiltersDraft } from '../../../hooks';
import { DateRangeField } from './DateRangeField';
import { DepartmentField } from './DepartmentField';
import { FiltersActions } from './FiltersActions';
import { KeywordField } from './KeywordField';

const GalleryFiltersForm = ({
  currentFilters,
  departments,
  departmentsLoading,
  setFilters,
  resetToHighlights,
}: FiltersFormProps) => {
  const {
    departmentId,
    setDepartmentId,
    keyword,
    setKeyword,
    dateBeginInput,
    setDateBeginInput,
    dateEndInput,
    setDateEndInput,
    commitSearch,
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
          onSubmit={commitSearch}
        />
      </div>
      <DateRangeField
        dateBeginInput={dateBeginInput}
        dateEndInput={dateEndInput}
        onDateBeginChange={setDateBeginInput}
        onDateEndChange={setDateEndInput}
        onSubmit={commitSearch}
      />
      <FiltersActions
        onSearch={commitSearch}
        onReset={resetToHighlights}
        searchDisabled={departmentsLoading}
      />
    </section>
  );
};

export default GalleryFiltersForm;
