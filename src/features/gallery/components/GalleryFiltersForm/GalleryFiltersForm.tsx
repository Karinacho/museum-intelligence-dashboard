import type { FiltersFormProps } from '../../types';
import type { MetDepartment } from '../../types';
import { useDepartments } from '../../hooks';
import styles from './GalleryFiltersForm.module.css';
import { useGalleryFiltersDraft } from '../../hooks';
import { urlFiltersKey } from '../../lib/urlFiltersKey';
import { DateRangeField } from './GalleryFormFilterInputs/DateRangeField';
import { DepartmentField } from './GalleryFormFilterInputs/DepartmentField';
import { FiltersActions } from './GalleryFormFilterInputs/FiltersActions';
import { KeywordField } from './GalleryFormFilterInputs/KeywordField';

type InnerProps = FiltersFormProps & {
  departments: MetDepartment[] | undefined;
  departmentsLoading: boolean;
};

function GalleryFiltersFormInner({
  currentFilters,
  setFilters,
  resetToHighlights,
  departments,
  departmentsLoading,
}: InnerProps) {
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
}

const GalleryFiltersForm = ({
  currentFilters,
  setFilters,
  resetToHighlights,
}: FiltersFormProps) => {
  const { data: departments, isPending: departmentsLoading } = useDepartments();

  return (
    <GalleryFiltersFormInner
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
