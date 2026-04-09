export type MetDepartment = {
  departmentId: number;
  displayName: string;
};

export type UrlGalleryFilters = {
  departmentId?: number;
  keyword?: string;
  /** Object begin/end year (CE; negative for BCE), passed to Met `dateBegin` / `dateEnd`. */
  dateBegin?: number;
  dateEnd?: number;
};

export interface FiltersBarProps {
  currentFilters: UrlGalleryFilters;
  setFilters: (next: UrlGalleryFilters) => void;
  resetToHighlights: () => void;
}

export interface FiltersFormProps extends FiltersBarProps {
  departments: MetDepartment[] | undefined;
  departmentsLoading: boolean;
}
