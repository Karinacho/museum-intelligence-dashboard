/**
 * Assessment: gallery API async flows (search, departments, object fetch, batch resilience).
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { metClient } from '@/lib/api/metMuseumClient';
import {
  fetchDepartments,
  fetchGalleryObjectIdList,
  fetchObjectsBatch,
  fetchSearchObjectIds,
} from '@/features/gallery/api/galleryApi';
import { metObjectResponseMinimal } from '@/testing/fixtures/metObject';

describe('Assessment — asynchronous data flow', () => {
  const getSpy = vi.spyOn(metClient, 'get');

  beforeEach(() => {
    getSpy.mockReset();
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('fetchSearchObjectIds forwards query string and returns object id list', async () => {
    getSpy.mockResolvedValueOnce({
      total: 2,
      objectIDs: [101, 102],
    });
    const ids = await fetchSearchObjectIds('q=*&hasImages=true');
    expect(ids).toEqual([101, 102]);
    expect(getSpy).toHaveBeenCalledWith('/search?q=*&hasImages=true', undefined);
  });

  it('fetchSearchObjectIds yields empty array when API omits objectIDs', async () => {
    getSpy.mockResolvedValueOnce({ total: 0, objectIDs: [] });
    const ids = await fetchSearchObjectIds('q=none');
    expect(ids).toEqual([]);
  });

  it('fetchGalleryObjectIdList intersects global search with department IDs when both set', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    getSpy.mockImplementation(async (endpoint: string) => {
      if (endpoint.startsWith('/search?')) {
        expect(endpoint).not.toContain('departmentId');
        return { total: 3, objectIDs: [10, 20, 30] };
      }
      if (endpoint === '/objects?departmentIds=5') {
        return { total: 2, objectIDs: [20, 30, 40] };
      }
      throw new Error(`unexpected ${endpoint}`);
    });

    const ids = await fetchGalleryObjectIdList(
      { departmentId: 5, keyword: 'wood' },
      undefined,
      qc
    );
    expect(ids).toEqual([20, 30]);
  });

  it('fetchDepartments normalizes missing departments array', async () => {
    getSpy.mockResolvedValueOnce({} as { departments?: unknown });
    const list = await fetchDepartments();
    expect(list).toEqual([]);
  });

  it('fetchObjectsBatch continues when individual object requests fail', async () => {
    getSpy.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/objects/1') {
        throw new Error('Met API error: 500');
      }
      if (endpoint === '/objects/2') {
        return metObjectResponseMinimal({
          objectID: 2,
          title: 'Survivor',
        });
      }
      throw new Error(`unexpected ${endpoint}`);
    });

    const cards = await fetchObjectsBatch([1, 2], 6);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.id).toBe(2);
    expect(cards[0]?.title).toBe('Survivor');
  });
});
