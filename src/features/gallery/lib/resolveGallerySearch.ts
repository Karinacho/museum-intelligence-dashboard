/**
 * URL ↔ Met /search query mapping (pure helpers for tests and hooks).
 */

/** Open range bound sent to Met when the user supplies only one year (API expects a range). */
const MET_SEARCH_DATE_BEGIN_OPEN = -8000;
const MET_SEARCH_DATE_END_OPEN = 2030;

export type UrlGalleryFilters = {
  departmentId?: number;
  keyword?: string;
  /** Object begin/end year (CE; negative for BCE), passed to Met `dateBegin` / `dateEnd`. */
  dateBegin?: number;
  dateEnd?: number;
};

function parseIntParam(
  searchParams: URLSearchParams,
  key: string
): number | undefined {
  const raw = searchParams.get(key);
  if (raw === null || raw.trim() === '') return undefined;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isNaN(n) ? undefined : n;
}

export function parseFiltersFromParams(
  searchParams: URLSearchParams
): UrlGalleryFilters {
  const parsedFilters: UrlGalleryFilters = {};

  const dept = searchParams.get('dept');

  if (dept !== null && dept !== '') {
    const n = Number.parseInt(dept, 10);

    if (!Number.isNaN(n)) {
      parsedFilters.departmentId = n;
    } 
  }

  const kw = searchParams.get('keyword');
  if (kw !== null && kw.trim() !== '') {
    parsedFilters.keyword = kw;
  }

  const dateBegin = parseIntParam(searchParams, 'dateBegin');
  if (dateBegin !== undefined) {
    parsedFilters.dateBegin = dateBegin;
  }

  const dateEnd = parseIntParam(searchParams, 'dateEnd');
  if (dateEnd !== undefined) {
    parsedFilters.dateEnd = dateEnd;
  }

  return parsedFilters;
}

export function isHighlightsMode(state: UrlGalleryFilters): boolean {
  return (
    state.departmentId === undefined &&
    (state.keyword === undefined || state.keyword.trim() === '') &&
    state.dateBegin === undefined &&
    state.dateEnd === undefined
  );
}

/**
 * When at least one date bound is set, return both bounds for Met `/search`
 * (single-sided ranges are expanded to a full interval).
 */
export function effectiveMetSearchDateBounds(
  state: UrlGalleryFilters
): { dateBegin: number; dateEnd: number } | null {
  const b = state.dateBegin;
  const e = state.dateEnd;
  if (b === undefined && e === undefined) return null;
  if (b !== undefined && e !== undefined) return { dateBegin: b, dateEnd: e };
  if (b !== undefined) {
    return { dateBegin: b, dateEnd: MET_SEARCH_DATE_END_OPEN };
  }
  return { dateBegin: MET_SEARCH_DATE_BEGIN_OPEN, dateEnd: e! };
}

/**
 * Use `/objects?departmentIds=X` for the ID list (complete for that department)
 * when there is no keyword and no date filter.
 */
export function usesDepartmentObjectList(state: UrlGalleryFilters): boolean {
  return (
    state.departmentId !== undefined &&
    (state.keyword === undefined || state.keyword.trim() === '') &&
    state.dateBegin === undefined &&
    state.dateEnd === undefined
  );
}

/** Normalized slice of filters for TanStack Query cache keys (matches fetch semantics). */
export type GalleryObjectIdsKeyPart = {
  departmentId?: number;
  keyword?: string;
  dateBegin?: number;
  dateEnd?: number;
};

export function galleryObjectIdsQueryKeyPart(
  state: UrlGalleryFilters
): GalleryObjectIdsKeyPart {
  const kw = state.keyword?.trim();
  return {
    departmentId: state.departmentId,
    keyword: kw ? kw : undefined,
    dateBegin: state.dateBegin,
    dateEnd: state.dateEnd,
  };
}

export const galleryObjectIdsQueryKey = (state: UrlGalleryFilters) =>
  ['gallery-object-ids', galleryObjectIdsQueryKeyPart(state)] as const;

export function buildMetSearchQueryString(state: UrlGalleryFilters): string {
  const params = new URLSearchParams();

  const dates = effectiveMetSearchDateBounds(state);

  if (dates) {
    params.set('dateBegin', String(dates.dateBegin));
    params.set('dateEnd', String(dates.dateEnd));
  }
  if (state.departmentId !== undefined) {
    params.set('departmentId', String(state.departmentId));
  }

  params.set('q', state.keyword?.trim() ? state.keyword.trim() : '*');

  if (isHighlightsMode(state)) {
    params.set('isHighlight', 'true');
  }

  return params.toString();
}
