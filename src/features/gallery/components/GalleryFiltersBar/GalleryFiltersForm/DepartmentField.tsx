import type { MetDepartment } from '../../../types';
import styles from './GalleryFiltersForm.module.css';

type DepartmentFieldProps = {
  value: string;
  onChange: (value: string) => void;
  departments: MetDepartment[] | undefined;
  disabled: boolean;
};

export function DepartmentField({
  value,
  onChange,
  departments,
  disabled,
}: DepartmentFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="gallery-dept">
        Department
      </label>
      <select
        id="gallery-dept"
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Highlights</option>
        {departments?.map((d) => (
          <option key={d.departmentId} value={d.departmentId}>
            {d.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
