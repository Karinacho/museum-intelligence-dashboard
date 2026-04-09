import styles from './GalleryFiltersForm.module.css';

type KeywordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function KeywordField({ value, onChange, onSubmit }: KeywordFieldProps) {
  return (
    <div className={styles.fieldGrow}>
      <label className={styles.label} htmlFor="gallery-keyword">
        Keyword
      </label>
      <input
        id="gallery-keyword"
        className={styles.input}
        type="search"
        placeholder="Title, culture, tags…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
        }}
      />
    </div>
  );
}
