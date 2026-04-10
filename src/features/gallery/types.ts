import { transformArtwork } from '@/lib/models/artwork';
import type { MetObjectResponse } from '@/lib/models/artwork';

export type PaginatedArtworkGridProps = {
  objectIds: number[];
  currentPage: number;
  onPageChange: (page: number) => void;
  /** True while the object-ID list query is pending and empty — show skeleton grid only. */
  idsLoading?: boolean;
};

export type PageQueryData = {
  raw: MetObjectResponse;
  artwork: ReturnType<typeof transformArtwork>;
};

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

export interface FiltersFormProps {
  currentFilters: UrlGalleryFilters;
  setFilters: (next: UrlGalleryFilters) => void;
  resetToHighlights: () => void;
}
