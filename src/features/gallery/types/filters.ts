/**
 * Gallery filter configuration
 */
export interface GalleryFilters {
  departmentId?: number;
  dateBegin?: number; // Supports BCE (negative numbers)
  dateEnd?: number;
  keyword?: string;
  hasImages?: boolean;
  isHighlight?: boolean;
}

/**
 * Default filters for initial gallery load
 * Using highlights ensures:
 * - ~2K curated objects (manageable size)
 * - All have images (better UX)
 * - High-quality representative collection
 */
export const DEFAULT_GALLERY_FILTERS: GalleryFilters = {
  hasImages: true,
  isHighlight: true,
};

/**
 * Met Museum departments
 */
export const DEPARTMENTS = [
  { id: 1, name: 'American Decorative Arts' },
  { id: 3, name: 'Ancient Near Eastern Art' },
  { id: 4, name: 'Arms and Armor' },
  { id: 5, name: 'Arts of Africa, Oceania, and the Americas' },
  { id: 6, name: 'Asian Art' },
  { id: 7, name: 'The Cloisters' },
  { id: 8, name: 'The Costume Institute' },
  { id: 9, name: 'Drawings and Prints' },
  { id: 10, name: 'Egyptian Art' },
  { id: 11, name: 'European Paintings' },
  { id: 12, name: 'European Sculpture and Decorative Arts' },
  { id: 13, name: 'Greek and Roman Art' },
  { id: 14, name: 'Islamic Art' },
  { id: 15, name: 'The Robert Lehman Collection' },
  { id: 16, name: 'The Libraries' },
  { id: 17, name: 'Medieval Art' },
  { id: 18, name: 'Musical Instruments' },
  { id: 19, name: 'Photographs' },
  { id: 21, name: 'Modern Art' },
] as const;
