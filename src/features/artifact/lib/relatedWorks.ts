import type { ArtworkDetail } from '@/lib/models/artwork';
import type { MetDepartment } from '@/features/gallery/api/galleryApi';

/** Half-width of the “same historical period” window (years), signed Met API integers. */
export const RELATED_PERIOD_RADIUS = 50;

export const MAX_RELATED_IDS_TO_FETCH = 12;

export function resolveDepartmentIdByName(
  departmentName: string,
  departments: MetDepartment[] | undefined
): number | undefined {
  if (!departments?.length) return undefined;
  const t = departmentName.trim().toLowerCase();
  return departments.find(
    (d) => d.displayName.trim().toLowerCase() === t
  )?.departmentId;
}

const isUsableSignedYear = (n: number | null | undefined): n is number =>
  n != null && n !== 0 && !Number.isNaN(n);

/**
 * Picks a single signed Met year (negative = BCE) for period matching.
 */
export function signedCenterYearFromArtifact(detail: ArtworkDetail): number | null {
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

export function buildRelatedWorksSearchQueryString(
  departmentId: number,
  dateBegin: number,
  dateEnd: number
): string {
  const p = new URLSearchParams();
  p.set('q', '*');
  p.set('hasImages', 'true');
  p.set('departmentId', String(departmentId));
  p.set('dateBegin', String(dateBegin));
  p.set('dateEnd', String(dateEnd));
  return p.toString();
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
  departments: MetDepartment[] | undefined
): RelatedWorksReadiness {
  if (!detail) return { status: 'no-detail' };
  const departmentId = resolveDepartmentIdByName(detail.department, departments);
  if (departmentId == null) return { status: 'no-department' };
  const center = signedCenterYearFromArtifact(detail);
  if (center == null) return { status: 'no-date' };
  const { dateBegin, dateEnd } = relatedWorksDateBounds(center);
  return { status: 'ok', departmentId, dateBegin, dateEnd };
}
