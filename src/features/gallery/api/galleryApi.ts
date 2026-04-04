import { metClient } from '@/lib/api/metMuseumClient';
import {
  type MetObjectsResponse,
  type MetObjectResponse,
  type ArtworkCard,
  toArtworkCard,
} from '@/lib/models/artwork';

/**
 * Fetch all object IDs from Met Museum
 * This returns ~470K IDs and should be called once per session
 */
export const fetchAllObjectIds = async (): Promise<number[]> => {
  const response = await metClient.get<MetObjectsResponse>('/objects');
  return response.objectIDs;
};

/**
 * Fetch a single object's details by ID
 */
export const fetchObjectById = async (
  id: number
): Promise<MetObjectResponse> => {
  return await metClient.get<MetObjectResponse>(`/objects/${id}`);
};

/**
 * Fetch multiple objects with concurrency control
 * Prevents overwhelming the API and browser with too many simultaneous requests
 */
export const fetchObjectsBatch = async (
  ids: number[],
  concurrencyLimit: number = 6
): Promise<ArtworkCard[]> => {
  const results: (ArtworkCard | null)[] = [];

  // Process IDs in batches to control concurrency
  for (let i = 0; i < ids.length; i += concurrencyLimit) {
    const batch = ids.slice(i, i + concurrencyLimit);

    const batchResults = await Promise.allSettled(
      batch.map(async (id) => {
        try {
          const response = await fetchObjectById(id);
          return toArtworkCard(response);
        } catch (error) {
          console.warn(`Failed to fetch object ${id}:`, error);
          return null;
        }
      })
    );

    // Extract successful results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push(null);
      }
    });
  }

  // Filter out null values (failed fetches or invalid objects)
  return results.filter((item): item is ArtworkCard => item !== null);
};
