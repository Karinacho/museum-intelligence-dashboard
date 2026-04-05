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
 * Uses `/objects?departmentIds=` only for plain department browse (no keyword, no dates).
 * Otherwise uses Met `/search` with `q`, optional `departmentId`, and optional `dateBegin`/`dateEnd`.
 * `/search` returns a bounded `objectIDs` list for those queries (API behavior).
 */
export async function fetchGalleryObjectIdList(
  state: UrlGalleryFilters,
  signal: AbortSignal | undefined
): Promise<number[]> {
 
  if (usesDepartmentObjectList(state)) {
    return fetchObjectIdsByDepartment(state.departmentId!, signal);
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
