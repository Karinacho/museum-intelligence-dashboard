/**
 * Assessment: validates normalization of raw Met API payloads and URL → query mapping.
 */
import { describe, expect, it } from 'vitest';
import type { ArtworkDetail } from '@/lib/models/artwork';
import {
  parseDateFromObjectDateString,
  toArtworkDetail,
  transformArtwork,
  type MetObjectResponse,
} from '@/lib/models/artwork';
import {
  buildMetSearchQueryString,
  effectiveMetSearchDateBounds,
  galleryObjectIdsQueryKeyPart,
  isHighlightsMode,
  parseUrlGalleryFilters,
  usesDepartmentObjectList,
} from '@/features/gallery/lib/resolveGallerySearch';
import {
  buildRelatedWorksDepartmentSearchQueryString,
  buildRelatedWorksSearchQueryString,
  getRelatedWorksReadiness,
  metObjectOverlapsMetYearWindow,
  relatedWorksDateBounds,
  resolveDepartmentIdByName,
  signedCenterYearFromArtifact,
  takeRelatedIdsExcluding,
} from '@/features/artifact/lib/relatedWorks';
import { metObjectResponseMinimal } from '@/testing/fixtures/metObject';

describe('Assessment — data transformation', () => {
  describe('URL state → Met search query', () => {
    it('parses gallery filters from URLSearchParams', () => {
      const p = new URLSearchParams();
      p.set('dept', '10');
      p.set('keyword', ' scarab ');
      expect(parseUrlGalleryFilters(p)).toEqual({
        departmentId: 10,
        keyword: ' scarab ',
      });
    });

    it('detects highlights mode vs filtered mode', () => {
      expect(isHighlightsMode({})).toBe(true);
      expect(isHighlightsMode({ keyword: 'vase' })).toBe(false);
      expect(isHighlightsMode({ departmentId: 1 })).toBe(false);
    });

    it('ignores legacy all=1 in URL (no all-departments mode)', () => {
      const p = new URLSearchParams();
      p.set('all', '1');
      expect(parseUrlGalleryFilters(p)).toEqual({});
    });

    it('parses dateBegin and dateEnd from URL', () => {
      const p = new URLSearchParams();
      p.set('dept', '11');
      p.set('dateBegin', '1800');
      p.set('dateEnd', '1900');
      expect(parseUrlGalleryFilters(p)).toEqual({
        departmentId: 11,
        dateBegin: 1800,
        dateEnd: 1900,
      });
    });

    it('builds highlights Met query when no filters (isHighlight)', () => {
      const qs = buildMetSearchQueryString({});
      expect(qs).toContain('isHighlight=true');
      expect(qs).toContain('q=*');
    });

    it('uses full department ID list when department is set without keyword or dates', () => {
      expect(usesDepartmentObjectList({ departmentId: 9 })).toBe(true);
      expect(
        usesDepartmentObjectList({ departmentId: 9, keyword: 'ink' })
      ).toBe(false);
      expect(usesDepartmentObjectList({ keyword: 'vase' })).toBe(false);
      expect(
        usesDepartmentObjectList({
          departmentId: 9,
          dateBegin: 1800,
          dateEnd: 1900,
        })
      ).toBe(false);
    });

    it('builds Met query string with filters', () => {
      expect(buildMetSearchQueryString({})).toContain('isHighlight=true');
      expect(buildMetSearchQueryString({ departmentId: 10 })).toContain(
        'departmentId=10'
      );
      expect(buildMetSearchQueryString({ departmentId: 10 })).not.toContain(
        'isHighlight=true'
      );
      expect(buildMetSearchQueryString({ keyword: 'limestone' })).toContain(
        'q=limestone'
      );
      expect(buildMetSearchQueryString({ departmentId: 10 })).not.toContain(
        'dateBegin'
      );
      expect(buildMetSearchQueryString({ departmentId: 10 })).not.toContain(
        'dateEnd'
      );
    });

    it('buildMetSearchQueryString adds date range for department + dates', () => {
      const qs = buildMetSearchQueryString({
        departmentId: 11,
        dateBegin: 1800,
        dateEnd: 1900,
      });
      expect(qs).toContain('departmentId=11');
      expect(qs).toContain('dateBegin=1800');
      expect(qs).toContain('dateEnd=1900');
      expect(qs).toContain('q=*');
    });

    it('buildMetSearchQueryString combines keyword, department, and dates', () => {
      const qs = buildMetSearchQueryString({
        departmentId: 11,
        keyword: 'portrait',
        dateBegin: 1800,
        dateEnd: 1900,
      });
      expect(qs).toContain('departmentId=11');
      expect(qs).toContain('q=portrait');
      expect(qs).toContain('dateBegin=1800');
      expect(qs).toContain('dateEnd=1900');
    });

    it('effectiveMetSearchDateBounds expands a single-sided range', () => {
      expect(effectiveMetSearchDateBounds({ dateBegin: 1950 })).toEqual({
        dateBegin: 1950,
        dateEnd: 2030,
      });
      expect(effectiveMetSearchDateBounds({ dateEnd: 500 })).toEqual({
        dateBegin: -8000,
        dateEnd: 500,
      });
      expect(effectiveMetSearchDateBounds({})).toBeNull();
    });

    it('galleryObjectIdsQueryKeyPart normalizes keyword whitespace for cache keys', () => {
      expect(
        galleryObjectIdsQueryKeyPart({
          keyword: '  vase ',
          departmentId: 10,
        })
      ).toEqual({
        keyword: 'vase',
        departmentId: 10,
        dateBegin: undefined,
        dateEnd: undefined,
      });
    });
  });

  describe('Raw object JSON → internal models', () => {
    it('transformArtwork tolerates missing strings and still returns a card', () => {
      const card = transformArtwork(
        metObjectResponseMinimal({
          objectID: 99,
          title: '',
          artistDisplayName: '',
          objectDate: 'ca. 1850',
          objectBeginDate: 1850,
          primaryImageSmall: 'https://example.com/s.jpg',
        })
      );
      expect(card).toMatchObject({
        id: 99,
        title: 'Untitled',
        artist: 'Unknown artist',
        dateLine: 'ca. 1850',
        imageUrl: 'https://example.com/s.jpg',
      });
    });

    it('transformArtwork returns null when object id is absent', () => {
      const raw = metObjectResponseMinimal({ objectID: 1 });
      Reflect.deleteProperty(raw, 'objectID');
      expect(transformArtwork(raw as MetObjectResponse)).toBeNull();
    });

    it('parseDateFromObjectDateString handles BCE/CE text and signed years', () => {
      expect(parseDateFromObjectDateString('500 BCE')).toEqual({
        year: 500,
        era: 'BCE',
      });
      expect(parseDateFromObjectDateString('-300')).toEqual({
        year: 300,
        era: 'BCE',
      });
    });

    it('toArtworkDetail maps accession, medium, tags, credit, and object URL', () => {
      const detail = toArtworkDetail(
        metObjectResponseMinimal({
          objectID: 7,
          title: 'Bowl',
          accessionNumber: '  A.1.2  ',
          medium: 'Clay',
          dimensions: '10 cm',
          creditLine: 'Gift of X',
          objectURL: 'https://www.metmuseum.org/art/collection/search/7',
          tags: [{ term: 'Ceramics', AAT_URL: '', Wikidata_URL: '' }],
        })
      );
      expect(detail).toMatchObject({
        id: 7,
        accessionNumber: 'A.1.2',
        medium: 'Clay',
        dimensions: '10 cm',
        creditLine: 'Gift of X',
        tags: ['Ceramics'],
        objectUrl: 'https://www.metmuseum.org/art/collection/search/7',
      });
    });
  });

  describe('Related-works search derivation', () => {
    const baseDetail = (over: Partial<ArtworkDetail>): ArtworkDetail => ({
      id: 1,
      title: 'T',
      artist: 'A',
      dateLine: '1900',
      structuredDate: null,
      imageUrl: null,
      accessionNumber: 'x',
      medium: 'm',
      dimensions: 'd',
      tags: [],
      creditLine: 'c',
      department: 'European Paintings',
      culture: '',
      period: '',
      primaryImageLarge: null,
      objectBeginDate: null,
      objectEndDate: null,
      objectUrl: null,
      ...over,
    });

    it('resolves department id by display name (case-insensitive)', () => {
      const depts = [{ departmentId: 11, displayName: 'European Paintings' }];
      expect(resolveDepartmentIdByName('european paintings', depts)).toBe(11);
    });

    it('computes signed center year and ±50 date bounds', () => {
      expect(
        signedCenterYearFromArtifact(
          baseDetail({ objectBeginDate: 1800, objectEndDate: 1900 })
        )
      ).toBe(1850);
      expect(relatedWorksDateBounds(1000)).toEqual({
        dateBegin: 950,
        dateEnd: 1050,
      });
    });

    it('getRelatedWorksReadiness returns ok or blocking reasons', () => {
      const depts = [{ departmentId: 11, displayName: 'European Paintings' }];
      expect(
        getRelatedWorksReadiness(
          baseDetail({
            objectBeginDate: 1888,
            objectEndDate: 1890,
          }),
          depts,
          false
        )
      ).toEqual({
        status: 'ok',
        departmentId: 11,
        dateBegin: 1839,
        dateEnd: 1939,
      });
      expect(
        getRelatedWorksReadiness(
          baseDetail({
            objectBeginDate: 1888,
            objectEndDate: 1890,
          }),
          depts,
          true
        )
      ).toEqual({ status: 'departments-loading' });
      expect(
        getRelatedWorksReadiness(
          baseDetail({
            department: 'The American Wing',
            objectBeginDate: 1900,
            objectEndDate: 1900,
          }),
          depts,
          false
        )
      ).toEqual({ status: 'no-department' });
      expect(takeRelatedIdsExcluding([10, 20, 30], 20, 2)).toEqual([10, 30]);
    });

    it('metObjectOverlapsMetYearWindow respects ± window on Met dates', () => {
      const inWindow = {
        objectBeginDate: 1300,
        objectEndDate: 1350,
      } as MetObjectResponse;
      expect(metObjectOverlapsMetYearWindow(inWindow, 1283, 1383)).toBe(true);
      const outWindow = {
        objectBeginDate: 1500,
        objectEndDate: 1510,
      } as MetObjectResponse;
      expect(metObjectOverlapsMetYearWindow(outWindow, 1283, 1383)).toBe(
        false
      );
    });

    it('buildRelatedWorksSearchQueryString encodes department and date window', () => {
      const qs = buildRelatedWorksSearchQueryString(11, 950, 1050);
      expect(qs).toContain('departmentId=11');
      expect(qs).toContain('dateBegin=950');
      expect(qs).toContain('dateEnd=1050');
      expect(qs).not.toContain('hasImages');
    });

    it('buildRelatedWorksDepartmentSearchQueryString is department-only search', () => {
      const qs = buildRelatedWorksDepartmentSearchQueryString(3);
      expect(qs).toContain('departmentId=3');
      expect(qs).toContain('q=*');
      expect(qs).not.toContain('dateBegin');
    });

  });
});
