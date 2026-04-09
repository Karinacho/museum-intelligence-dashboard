import styles from './GalleryFiltersForm.module.css';

type DateRangeFieldProps = {
  dateBeginInput: string;
  dateEndInput: string;
  onDateBeginChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
  onSubmit: () => void;
};

export function DateRangeField({
  dateBeginInput,
  dateEndInput,
  onDateBeginChange,
  onDateEndChange,
  onSubmit,
}: DateRangeFieldProps) {
  return (
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
          onChange={(e) => onDateBeginChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
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
          onChange={(e) => onDateEndChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
        />
      </div>
    </div>
  );
}
