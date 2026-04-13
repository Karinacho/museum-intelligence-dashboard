import type { FiltersFormProps, MetDepartment } from '../../types';
import { useGalleryFiltersDraft } from '../../hooks';
import styles from './GalleryFiltersForm.module.css';
import { DateRangeField } from './GalleryFormFilterInputs/DateRangeField';
import { DepartmentField } from './GalleryFormFilterInputs/DepartmentField';
import { FiltersActions } from './GalleryFormFilterInputs/FiltersActions';
import { KeywordField } from './GalleryFormFilterInputs/KeywordField';

export type GalleryFiltersFormFieldsProps = FiltersFormProps & {
  departments: MetDepartment[] | undefined;
  departmentsLoading: boolean;
};

export function GalleryFiltersFormFields({
  currentFilters,
  setFilters,
  resetToHighlights,
  departments,
}: GalleryFiltersFormFieldsProps) {
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
      <FiltersActions onSearch={applyFilters} onReset={resetToHighlights} />
    </section>
  );
}
