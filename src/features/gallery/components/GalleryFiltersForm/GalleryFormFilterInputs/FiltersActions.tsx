import styles from '../../GalleryFiltersForm/GalleryFiltersForm.module.css';

type FiltersActionsProps = {
  onSearch: () => void;
  onReset: () => void;
};

export function FiltersActions({ onSearch, onReset }: FiltersActionsProps) {
  return (
    <>
      <p className={styles.hint}>
        Changes apply when you press Search collection or Enter in a field.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onSearch}>
          Search collection
        </button>
        <button type="button" className={styles.ghost} onClick={onReset}>
          Show highlights
        </button>
      </div>
    </>
  );
}
