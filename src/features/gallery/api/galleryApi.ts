import { metClient } from '@/lib/api/metMuseumClient';
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

export const fetchSearchObjectIds = async (
  metSearchQueryString: string
): Promise<number[]> => {
  const response = await metClient.get<MetObjectsResponse>(
    `/search?${metSearchQueryString}`
  );
  return response.objectIDs ?? [];
};

export const fetchObjectById = async (
  id: number
): Promise<MetObjectResponse> => {
  return metClient.get<MetObjectResponse>(`/objects/${id}`);
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
