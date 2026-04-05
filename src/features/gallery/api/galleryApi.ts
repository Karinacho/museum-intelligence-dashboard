import type { QueryClient } from '@tanstack/react-query';
import { metClient } from '@/lib/api/metMuseumClient';
import {
  buildMetSearchQueryString,
  usesDepartmentObjectList,
  type UrlGalleryFilters,
} from '@/features/gallery/lib/resolveGallerySearch';
import {
  type MetObjectsResponse,
  type MetObjectResponse,
  type ArtworkCard,
  transformArtwork,
} from '@/lib/models/artwork';

const DEPARTMENT_IDS_STALE_MS = 1000 * 60 * 5;
const DEPARTMENT_IDS_GC_MS = 1000 * 60 * 10;

export type MetDepartment = {
  departmentId: number;
  displayName: string;
};

export const fetchDepartments = async (): Promise<MetDepartment[]> => {
  const response = await metClient.get<{ departments: MetDepartment[] }>(
    '/departments'
  );
  return response.departments ?? [];
};

/**
 * Full collection ID list (~470k) — avoid for gallery; kept for legacy hooks.
 */
export const fetchAllObjectIds = async (): Promise<number[]> => {
  const response = await metClient.get<MetObjectsResponse>('/objects');
  return response.objectIDs ?? [];
};

export const fetchObjectIdsByDepartment = async (
  departmentId: number,
  signal?: AbortSignal
): Promise<number[]> => {
  const response = await metClient.get<MetObjectsResponse>(
    `/objects?departmentIds=${departmentId}`,
    signal
  );
  return response.objectIDs ?? [];
};

export const fetchSearchObjectIds = async (
  metSearchQueryString: string,
  signal?: AbortSignal
): Promise<number[]> => {
  const response = await metClient.get<MetObjectsResponse>(
    `/search?${metSearchQueryString}`,
    signal
  );
  return response.objectIDs ?? [];
};

/**
 * Resolves gallery object IDs for the current URL filters.
 * When both department and keyword are set, Met's combined `/search` is overly
 * narrow; we intersect a global keyword search with the full department ID list.
 * (Global search only returns a bounded set of IDs from Met; very broad terms
 * may omit some matches.)
 */
export async function fetchGalleryObjectIdList(
  state: UrlGalleryFilters,
  signal: AbortSignal | undefined,
  queryClient: QueryClient
): Promise<number[]> {
  if (usesDepartmentObjectList(state)) {
    return fetchObjectIdsByDepartment(state.departmentId!, signal);
  }

  const keyword = state.keyword?.trim();
  if (state.departmentId !== undefined && keyword) {
    const searchQs = buildMetSearchQueryString({
      ...state,
      departmentId: undefined,
    });
    const searchIds = await fetchSearchObjectIds(searchQs, signal);
    const deptIds = await queryClient.fetchQuery({
      queryKey: ['department-objects', state.departmentId],
      queryFn: ({ signal: s }) =>
        fetchObjectIdsByDepartment(state.departmentId!, s),
      signal,
      staleTime: DEPARTMENT_IDS_STALE_MS,
      gcTime: DEPARTMENT_IDS_GC_MS,
    });
    const deptSet = new Set(deptIds);
    return searchIds.filter((id) => deptSet.has(id));
  }

  return fetchSearchObjectIds(buildMetSearchQueryString(state), signal);
}

export const fetchObjectById = async (
  id: number,
  signal?: AbortSignal
): Promise<MetObjectResponse> => {
  return metClient.get<MetObjectResponse>(`/objects/${id}`, signal);
};

export const fetchObjectsBatch = async (
  ids: number[],
  concurrencyLimit: number = 6
): Promise<ArtworkCard[]> => {
  const results: (ArtworkCard | null)[] = [];

  for (let i = 0; i < ids.length; i += concurrencyLimit) {
    const batch = ids.slice(i, i + concurrencyLimit);

    const batchResults = await Promise.allSettled(
      batch.map(async (id) => {
        try {
          const response = await fetchObjectById(id);
          return transformArtwork(response);
        } catch {
          return null;
        }
      })
    );

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push(null);
      }
    });
  }

  return results.filter((item): item is ArtworkCard => item !== null);
};
