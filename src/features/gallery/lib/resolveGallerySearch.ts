/**
 * URL ↔ Met /search query mapping (pure helpers for tests and hooks).
 */

export type UrlGalleryFilters = {
  departmentId?: number;
  dateBegin?: number;
  dateEnd?: number;
  keyword?: string;
};

export function parseUrlGalleryFilters(
  searchParams: URLSearchParams
): UrlGalleryFilters {
  const out: UrlGalleryFilters = {};

  const dept = searchParams.get('dept');
  if (dept !== null && dept !== '') {
    const n = Number.parseInt(dept, 10);
    if (!Number.isNaN(n)) out.departmentId = n;
  }

  const db = searchParams.get('dateBegin');
  if (db !== null && db !== '') {
    const n = Number.parseInt(db, 10);
    if (!Number.isNaN(n)) out.dateBegin = n;
  }

  const de = searchParams.get('dateEnd');
  if (de !== null && de !== '') {
    const n = Number.parseInt(de, 10);
    if (!Number.isNaN(n)) out.dateEnd = n;
  }

  const kw = searchParams.get('keyword');
  if (kw !== null && kw.trim() !== '') {
    out.keyword = kw;
  }

  return out;
}

export function isHighlightsMode(state: UrlGalleryFilters): boolean {
  return (
    state.departmentId === undefined &&
    state.dateBegin === undefined &&
    state.dateEnd === undefined &&
    (state.keyword === undefined || state.keyword.trim() === '')
  );
}

/**
 * Use `/objects?departmentIds=X` for the ID list (complete for that department).
 * When the user also sets dates, filter in the client after loading object details;
 * Met `/search` with departmentId + dates often returns empty or tiny sets because
 * the search index does not line up with the full department catalog.
 */
export function usesDepartmentObjectList(state: UrlGalleryFilters): boolean {
  return (
    state.departmentId !== undefined &&
    (state.keyword === undefined || state.keyword.trim() === '')
  );
}

/**
 * Met `/search` only applies date filters when **both** `dateBegin` and `dateEnd`
 * are present. For an open-ended range in the UI, we supply a wide bound so the
 * user’s single date still constrains results.
 */
const MET_SEARCH_OPEN_BEGIN = -8000;
const MET_SEARCH_OPEN_END = 9999;

export function effectiveMetSearchDateBounds(state: UrlGalleryFilters): {
  dateBegin?: number;
  dateEnd?: number;
} {
  const { dateBegin, dateEnd } = state;
  if (dateBegin === undefined && dateEnd === undefined) return {};
  if (dateBegin !== undefined && dateEnd !== undefined) {
    return { dateBegin, dateEnd };
  }
  if (dateEnd !== undefined) {
    return { dateBegin: MET_SEARCH_OPEN_BEGIN, dateEnd };
  }
  return { dateBegin, dateEnd: MET_SEARCH_OPEN_END };
}

export function buildMetSearchQueryString(state: UrlGalleryFilters): string {
  const params = new URLSearchParams();
  params.set('q', state.keyword?.trim() ? state.keyword.trim() : '*');
  params.set('hasImages', 'true');
  if (isHighlightsMode(state)) {
    params.set('isHighlight', 'true');
  }

  if (state.departmentId !== undefined) {
    params.set('departmentId', String(state.departmentId));
  }

  const { dateBegin: metBegin, dateEnd: metEnd } =
    effectiveMetSearchDateBounds(state);
  if (metBegin !== undefined) {
    params.set('dateBegin', String(metBegin));
  }
  if (metEnd !== undefined) {
    params.set('dateEnd', String(metEnd));
  }

  return params.toString();
}
