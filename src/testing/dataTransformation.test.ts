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
  isHighlightsMode,
  parseUrlGalleryFilters,
} from '@/features/gallery/lib/resolveGallerySearch';
import {
  buildRelatedWorksSearchQueryString,
  getRelatedWorksReadiness,
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
      p.set('dateBegin', '-1200');
      p.set('dateEnd', '500');
      p.set('keyword', ' scarab ');
      expect(parseUrlGalleryFilters(p)).toEqual({
        departmentId: 10,
        dateBegin: -1200,
        dateEnd: 500,
        keyword: ' scarab ',
      });
    });

    it('detects highlights mode vs filtered mode', () => {
      expect(isHighlightsMode({})).toBe(true);
      expect(isHighlightsMode({ keyword: 'vase' })).toBe(false);
    });

    it('builds Met query string with filters', () => {
      expect(buildMetSearchQueryString({})).toContain('isHighlight=true');
      expect(buildMetSearchQueryString({})).toContain('hasImages=true');
      expect(buildMetSearchQueryString({ departmentId: 10 })).toContain(
        'departmentId=10'
      );
      expect(buildMetSearchQueryString({ departmentId: 10 })).not.toContain(
        'isHighlight=true'
      );
      expect(buildMetSearchQueryString({ keyword: 'limestone' })).toContain(
        'q=limestone'
      );
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
      const depts = [
        { departmentId: 11, displayName: 'European Paintings' },
      ];
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
          depts
        )
      ).toEqual({
        status: 'ok',
        departmentId: 11,
        dateBegin: 1839,
        dateEnd: 1939,
      });
      expect(
        takeRelatedIdsExcluding([10, 20, 30], 20, 2)
      ).toEqual([10, 30]);
    });

    it('buildRelatedWorksSearchQueryString encodes department and date window', () => {
      const qs = buildRelatedWorksSearchQueryString(11, 950, 1050);
      expect(qs).toContain('departmentId=11');
      expect(qs).toContain('dateBegin=950');
      expect(qs).toContain('dateEnd=1050');
      expect(qs).toContain('hasImages=true');
    });
  });
});
