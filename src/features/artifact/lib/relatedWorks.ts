import type { ArtworkDetail, MetObjectResponse } from '@/lib/models/artwork';
import type { MetDepartment } from '@/features/gallery/api/galleryApi';
import {
  fetchObjectById,
  fetchObjectIdsByDepartment,
  fetchSearchObjectIds,
} from '@/features/gallery/api/galleryApi';

/** Half-width of the “same historical period” window (years), signed Met API integers. */
export const RELATED_PERIOD_RADIUS = 50;

export const MAX_RELATED_IDS_TO_FETCH = 12;

/**
 * Met `/search` with department + dates often returns 0 even when objects exist.
 * We then match ±50 by fetching `/objects/{id}` for candidates. Strategy:
 * 1) Department-only `/search` (small ID list, one request) — often enough hits, avoids huge `/objects?departmentIds=` first.
 * 2) If still short, `/objects?departmentIds=` (capped slice), skipping IDs already checked.
 */
const RELATED_WORKS_DEPARTMENT_SCAN_CAP = 500;
/** Larger batches = fewer micro-rounds; Met client global queue still caps parallel in-flight requests. */
const RELATED_WORKS_FETCH_CONCURRENCY = 12;

export function resolveDepartmentIdByName(
  departmentName: string,
  departments: MetDepartment[] | undefined
): number | undefined {
  if (!departments?.length) return undefined;
  const t = departmentName.trim().toLowerCase();
  return departments.find((d) => d.displayName.trim().toLowerCase() === t)
    ?.departmentId;
}

const isUsableSignedYear = (n: number | null | undefined): n is number =>
  n != null && n !== 0 && !Number.isNaN(n);

/**
 * Picks a single signed Met year (negative = BCE) for period matching.
 */
export function signedCenterYearFromArtifact(
  detail: ArtworkDetail
): number | null {
  const b = detail.objectBeginDate;
  const e = detail.objectEndDate;
  if (isUsableSignedYear(b) && isUsableSignedYear(e)) {
    return Math.round((b + e) / 2);
  }
  if (isUsableSignedYear(b)) return b;
  if (isUsableSignedYear(e)) return e;
  if (detail.structuredDate) {
    const y = detail.structuredDate.year;
    return detail.structuredDate.era === 'BCE' ? -y : y;
  }
  return null;
}

export function relatedWorksDateBounds(centerSigned: number): {
  dateBegin: number;
  dateEnd: number;
} {
  return {
    dateBegin: centerSigned - RELATED_PERIOD_RADIUS,
    dateEnd: centerSigned + RELATED_PERIOD_RADIUS,
  };
}

/**
 * Met search for related works: omit `hasImages` (it often zeros out department + date results).
 */
export function buildRelatedWorksSearchQueryString(
  departmentId: number,
  dateBegin: number,
  dateEnd: number
): string {
  const p = new URLSearchParams();
  p.set('q', '*');
  p.set('departmentId', String(departmentId));
  p.set('dateBegin', String(dateBegin));
  p.set('dateEnd', String(dateEnd));
  return p.toString();
}

/** Department-scoped Met search (bounded objectID list) — faster to fetch than full `/objects?departmentIds=`. */
export function buildRelatedWorksDepartmentSearchQueryString(
  departmentId: number
): string {
  const p = new URLSearchParams();
  p.set('q', '*');
  p.set('departmentId', String(departmentId));
  return p.toString();
}

/** True if the object’s Met begin/end range overlaps [windowBegin, windowEnd] (signed years). */
export function metObjectOverlapsMetYearWindow(
  obj: MetObjectResponse,
  windowBegin: number,
  windowEnd: number
): boolean {
  const b = obj.objectBeginDate;
  const e = obj.objectEndDate;
  const bOk = isUsableSignedYear(b);
  const eOk = isUsableSignedYear(e);
  if (!bOk && !eOk) return false;
  const low = bOk && eOk ? Math.min(b, e) : bOk ? b : e!;
  const high = bOk && eOk ? Math.max(b, e) : low;
  const w0 = Math.min(windowBegin, windowEnd);
  const w1 = Math.max(windowBegin, windowEnd);
  return low <= w1 && high >= w0;
}

async function collectMatchingIdsFromCandidateIds(
  candidateIds: number[],
  dateBegin: number,
  dateEnd: number,
  excludeId: number,
  limit: number,
  signal: AbortSignal | undefined
): Promise<number[]> {
  const ids = candidateIds.filter((id) => id !== excludeId);
  const out: number[] = [];
  for (
    let i = 0;
    i < ids.length && out.length < limit;
    i += RELATED_WORKS_FETCH_CONCURRENCY
  ) {
    const batch = ids.slice(i, i + RELATED_WORKS_FETCH_CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((id) => fetchObjectById(id, signal))
    );
    for (let j = 0; j < batch.length && out.length < limit; j++) {
      const r = settled[j];
      if (r.status !== 'fulfilled') continue;
      if (metObjectOverlapsMetYearWindow(r.value, dateBegin, dateEnd)) {
        out.push(batch[j]);
      }
    }
  }
  return out;
}

/**
 * Same department + overlapping ±50 year window only. Uses Met search first; if empty, scans
 * department object IDs (capped) and filters with object metadata.
 */
export async function fetchRelatedWorkIdsStrict(
  departmentId: number,
  dateBegin: number,
  dateEnd: number,
  excludeId: number,
  limit: number,
  signal: AbortSignal | undefined
): Promise<number[]> {
  const qs = buildRelatedWorksSearchQueryString(
    departmentId,
    dateBegin,
    dateEnd
  );
  const fromSearch = await fetchSearchObjectIds(qs, signal);
  if (fromSearch.length > 0) {
    return takeRelatedIdsExcluding(fromSearch, excludeId, limit);
  }

  const deptSearchQs =
    buildRelatedWorksDepartmentSearchQueryString(departmentId);
  const searchPool = await fetchSearchObjectIds(deptSearchQs, signal);

  const fromSearchPool = await collectMatchingIdsFromCandidateIds(
    searchPool,
    dateBegin,
    dateEnd,
    excludeId,
    limit,
    signal
  );
  if (fromSearchPool.length >= limit) {
    return fromSearchPool;
  }

  const alreadySeen = new Set<number>([excludeId, ...searchPool]);
  const allDeptIds = await fetchObjectIdsByDepartment(departmentId, signal);
  const rest = allDeptIds
    .filter((id) => !alreadySeen.has(id))
    .slice(0, RELATED_WORKS_DEPARTMENT_SCAN_CAP);

  const fromDeptList = await collectMatchingIdsFromCandidateIds(
    rest,
    dateBegin,
    dateEnd,
    excludeId,
    limit - fromSearchPool.length,
    signal
  );
  return [...fromSearchPool, ...fromDeptList];
}

export function takeRelatedIdsExcluding(
  ids: number[],
  excludeId: number,
  limit: number
): number[] {
  const out: number[] = [];
  for (const id of ids) {
    if (id === excludeId) continue;
    out.push(id);
    if (out.length >= limit) break;
  }
  return out;
}

export type RelatedWorksReadiness =
  | { status: 'no-detail' }
  | { status: 'departments-loading' }
  | { status: 'no-department' }
  | { status: 'no-date' }
  | {
      status: 'ok';
      departmentId: number;
      dateBegin: number;
      dateEnd: number;
    };

export function getRelatedWorksReadiness(
  detail: ArtworkDetail | null | undefined,
  departments: MetDepartment[] | undefined,
  departmentsLoading: boolean
): RelatedWorksReadiness {
  if (!detail) return { status: 'no-detail' };
  if (departmentsLoading) return { status: 'departments-loading' };
  const center = signedCenterYearFromArtifact(detail);
  if (center == null) return { status: 'no-date' };
  const { dateBegin, dateEnd } = relatedWorksDateBounds(center);
  const departmentId = resolveDepartmentIdByName(
    detail.department,
    departments
  );
  if (departmentId == null) return { status: 'no-department' };
  return { status: 'ok', departmentId, dateBegin, dateEnd };
}
