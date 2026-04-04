import { metClient } from '@/lib/api/metMuseumClient';
import {
  type MetObjectsResponse,
  type MetObjectResponse,
  type ArtworkCard,
  toArtworkCard,
} from '@/lib/models/artwork';
import { type GalleryFilters } from '../types/filters';

/**
 * Fetch all object IDs from Met Museum
 * This returns ~470K IDs and should be called once per session
 * @deprecated Use fetchSearchObjectIds with filters instead
 */
export const fetchAllObjectIds = async (): Promise<number[]> => {
  const response = await metClient.get<MetObjectsResponse>('/objects');
  return response.objectIDs;
};

/**
 * Build search query parameters from filters
 */
const buildSearchParams = (filters: GalleryFilters): string => {
  const params = new URLSearchParams();

  if (filters.hasImages !== undefined) {
    params.append('hasImages', String(filters.hasImages));
  }

  if (filters.isHighlight !== undefined) {
    params.append('isHighlight', String(filters.isHighlight));
  }

  if (filters.departmentId !== undefined) {
    params.append('departmentId', String(filters.departmentId));
  }

  if (filters.dateBegin !== undefined) {
    params.append('dateBegin', String(filters.dateBegin));
  }

  if (filters.dateEnd !== undefined) {
    params.append('dateEnd', String(filters.dateEnd));
  }

  if (filters.keyword) {
    params.append('q', filters.keyword);
  }

  return params.toString();
};

/**
 * Fetch object IDs based on search filters
 * This is the preferred method for filtered queries
 */
export const fetchSearchObjectIds = async (
  filters: GalleryFilters
): Promise<number[]> => {
  const queryString = buildSearchParams(filters);
  const endpoint = queryString ? `/search?${queryString}` : '/objects';

  const response = await metClient.get<MetObjectsResponse>(endpoint);

  // Handle case where no results found
  if (!response.objectIDs || response.objectIDs.length === 0) {
    return [];
  }

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
