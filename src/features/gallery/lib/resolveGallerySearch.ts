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

export function buildMetSearchQueryString(state: UrlGalleryFilters): string {
  const params = new URLSearchParams();
  params.set('q', state.keyword?.trim() ? state.keyword.trim() : '*');
  params.set('hasImages', 'true');

  if (state.departmentId !== undefined) {
    params.set('departmentId', String(state.departmentId));
  }
  if (state.dateBegin !== undefined) {
    params.set('dateBegin', String(state.dateBegin));
  }
  if (state.dateEnd !== undefined) {
    params.set('dateEnd', String(state.dateEnd));
  }

  return params.toString();
}
