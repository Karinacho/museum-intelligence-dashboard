import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilters } from '../hooks/useFilters';
import { useDepartments } from '../hooks/useDepartments';
import type { UrlGalleryFilters } from '../lib/resolveGallerySearch';
import type { MetDepartment } from '../api/galleryApi';
import styles from './GalleryFiltersBar.module.css';

type FormProps = {
  urlState: UrlGalleryFilters;
  departments: MetDepartment[] | undefined;
  departmentsLoading: boolean;
  setFilters: (next: UrlGalleryFilters) => void;
  resetToHighlights: () => void;
};

const GalleryFiltersForm = ({
  urlState,
  departments,
  departmentsLoading,
  setFilters,
  resetToHighlights,
}: FormProps) => {
  const [departmentId, setDepartmentId] = useState(
    () => (urlState.departmentId != null ? String(urlState.departmentId) : '')
  );
  const [dateBegin, setDateBegin] = useState(() =>
    urlState.dateBegin != null && !Number.isNaN(urlState.dateBegin)
      ? String(urlState.dateBegin)
      : ''
  );
  const [dateEnd, setDateEnd] = useState(() =>
    urlState.dateEnd != null && !Number.isNaN(urlState.dateEnd)
      ? String(urlState.dateEnd)
      : ''
  );
  const [keyword, setKeyword] = useState(() => urlState.keyword ?? '');

  const applySearch = () => {
    const next: UrlGalleryFilters = {};

    if (departmentId !== '') {
      const id = Number.parseInt(departmentId, 10);
      if (!Number.isNaN(id)) next.departmentId = id;
    }

    if (dateBegin.trim() !== '') {
      const n = Number.parseInt(dateBegin.trim(), 10);
      if (!Number.isNaN(n)) next.dateBegin = n;
    }

    if (dateEnd.trim() !== '') {
      const n = Number.parseInt(dateEnd.trim(), 10);
      if (!Number.isNaN(n)) next.dateEnd = n;
    }

    if (keyword.trim() !== '') {
      next.keyword = keyword.trim();
    }

    setFilters(next);
  };

  return (
    <section className={styles.bar} aria-label="Search and filters">
      <p className={styles.hint}>
        Use negative years for BCE (for example -500 for 500 BCE). Leave dates
        empty to include all periods in the chosen department.
      </p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-dept">
            Department
          </label>
          <select
            id="gallery-dept"
            className={styles.select}
            value={departmentId}
            disabled={departmentsLoading}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-date-begin">
            Date begin
          </label>
          <input
            id="gallery-date-begin"
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="e.g. -500 or 1800"
            value={dateBegin}
            onChange={(e) => setDateBegin(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-date-end">
            Date end
          </label>
          <input
            id="gallery-date-end"
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="e.g. 100 or 1920"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
        </div>
        <div className={styles.fieldGrow}>
          <label className={styles.label} htmlFor="gallery-keyword">
            Keyword
          </label>
          <input
            id="gallery-keyword"
            className={styles.input}
            type="search"
            placeholder="Title, culture, tags…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applySearch();
            }}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={applySearch}
          disabled={departmentsLoading}
        >
          Search collection
        </button>
        <button
          type="button"
          className={styles.ghost}
          onClick={resetToHighlights}
        >
          Show highlights
        </button>
      </div>
    </section>
  );
};

const GalleryFiltersBar = () => {
  const [searchParams] = useSearchParams();
  const { urlState, setFilters, resetToHighlights } = useFilters();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  return (
    <GalleryFiltersForm
      key={searchParams.toString()}
      urlState={urlState}
      departments={departments}
      departmentsLoading={departmentsLoading}
      setFilters={setFilters}
      resetToHighlights={resetToHighlights}
    />
  );
};

export default GalleryFiltersBar;
