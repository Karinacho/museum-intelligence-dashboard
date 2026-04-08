import { useCallback, useEffect, useState } from 'react';
import { useFilters } from '../../hooks/useFilters.ts';
import { useDepartments } from '@/features/gallery/hooks';
import type { UrlGalleryFilters } from '../../lib/resolveGallerySearch.ts';
import type { MetDepartment } from '../../api/galleryApi.ts';
import styles from './GalleryFiltersBar.module.css';

type Draft = {
  departmentId: string;
  keyword: string;
  dateBeginInput: string;
  dateEndInput: string;
};

function buildFiltersFromDraft(d: Draft): UrlGalleryFilters {
  const next: UrlGalleryFilters = {};

  if (d.departmentId !== '') {
    const id = Number.parseInt(d.departmentId, 10);
    if (!Number.isNaN(id)) next.departmentId = id;
  }

  if (d.keyword.trim() !== '') {
    next.keyword = d.keyword.trim();
  }

  if (d.dateBeginInput.trim() !== '') {
    const y = Number.parseInt(d.dateBeginInput.trim(), 10);
    if (!Number.isNaN(y)) next.dateBegin = y;
  }
  if (d.dateEndInput.trim() !== '') {
    const y = Number.parseInt(d.dateEndInput.trim(), 10);
    if (!Number.isNaN(y)) next.dateEnd = y;
  }

  return next;
}

type FormProps = {
  currentFilters: UrlGalleryFilters;
  departments: MetDepartment[] | undefined;
  departmentsLoading: boolean;
  setFilters: (next: UrlGalleryFilters) => void;
  resetToHighlights: () => void;
};

const GalleryFiltersForm = ({
  currentFilters,
  departments,
  departmentsLoading,
  setFilters,
  resetToHighlights,
}: FormProps) => {
  const [departmentId, setDepartmentId] = useState(() =>
    currentFilters.departmentId != null ? String(currentFilters.departmentId) : ''
  );
  const [keyword, setKeyword] = useState(() => currentFilters.keyword ?? '');
  const [dateBeginInput, setDateBeginInput] = useState(() =>
    currentFilters.dateBegin != null ? String(currentFilters.dateBegin) : ''
  );
  const [dateEndInput, setDateEndInput] = useState(() =>
    currentFilters.dateEnd != null ? String(currentFilters.dateEnd) : ''
  );

  const commitSearch = useCallback(() => {
    setFilters(
      buildFiltersFromDraft({
        departmentId,
        keyword,
        dateBeginInput,
        dateEndInput,
      })
    );
  }, [setFilters, departmentId, keyword, dateBeginInput, dateEndInput]);

  useEffect(() => {
    queueMicrotask(() => {
      setDepartmentId(
        currentFilters.departmentId != null ? String(currentFilters.departmentId) : ''
      );
      setKeyword(currentFilters.keyword ?? '');
      setDateBeginInput(
        currentFilters.dateBegin != null ? String(currentFilters.dateBegin) : ''
      );
      setDateEndInput(currentFilters.dateEnd != null ? String(currentFilters.dateEnd) : '');
    });
  }, [
    currentFilters.departmentId,
    currentFilters.keyword,
    currentFilters.dateBegin,
    currentFilters.dateEnd,
  ]);

  return (
    <section className={styles.bar} aria-label="Search and filters">
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
            onChange={(e) => {
              setDepartmentId(e.target.value);
            }}
          >
            <option value="">Highlights</option>
            {departments?.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.displayName}
              </option>
            ))}
          </select>
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
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitSearch();
            }}
          />
        </div>
      </div>
      <div className={styles.row} role="group" aria-label="Date range">
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-date-begin">
            From year
          </label>
          <input
            id="gallery-date-begin"
            className={styles.input}
            type="number"
            inputMode="numeric"
            placeholder="e.g. 1800 or -500"
            value={dateBeginInput}
            onChange={(e) => {
              setDateBeginInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitSearch();
            }}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-date-end">
            To year
          </label>
          <input
            id="gallery-date-end"
            className={styles.input}
            type="number"
            inputMode="numeric"
            placeholder="e.g. 1900"
            value={dateEndInput}
            onChange={(e) => {
              setDateEndInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitSearch();
            }}
          />
        </div>
      </div>
      <p className={styles.hint}>
        Changes apply when you press Search collection or Enter in a field.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={commitSearch}
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
  const { currentFilters, setFilters, resetToHighlights } = useFilters();
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
