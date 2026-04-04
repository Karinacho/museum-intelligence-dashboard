import { describe, expect, it } from 'vitest';
import type { ArtworkDetail } from '@/lib/models/artwork';
import {
  buildRelatedWorksSearchQueryString,
  getRelatedWorksReadiness,
  relatedWorksDateBounds,
  resolveDepartmentIdByName,
  signedCenterYearFromArtifact,
  takeRelatedIdsExcluding,
} from './relatedWorks';

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

describe('resolveDepartmentIdByName', () => {
  const depts = [
    { departmentId: 11, displayName: 'European Paintings' },
    { departmentId: 10, displayName: 'Egyptian Art' },
  ];

  it('matches case-insensitively', () => {
    expect(resolveDepartmentIdByName('european paintings', depts)).toBe(11);
  });

  it('returns undefined when unknown', () => {
    expect(resolveDepartmentIdByName('Unknown Dept', depts)).toBeUndefined();
  });
});

describe('signedCenterYearFromArtifact', () => {
  it('uses midpoint of begin/end when both set', () => {
    expect(
      signedCenterYearFromArtifact(
        baseDetail({ objectBeginDate: 1800, objectEndDate: 1900 })
      )
    ).toBe(1850);
  });

  it('uses single bound when only one date', () => {
    expect(
      signedCenterYearFromArtifact(baseDetail({ objectBeginDate: -500 }))
    ).toBe(-500);
  });

  it('falls back to structured BCE/CE', () => {
    expect(
      signedCenterYearFromArtifact(
        baseDetail({
          objectBeginDate: null,
          objectEndDate: null,
          structuredDate: { year: 300, era: 'BCE' },
        })
      )
    ).toBe(-300);
  });
});

describe('relatedWorksDateBounds', () => {
  it('expands ±50 years', () => {
    expect(relatedWorksDateBounds(1000)).toEqual({
      dateBegin: 950,
      dateEnd: 1050,
    });
  });
});

describe('buildRelatedWorksSearchQueryString', () => {
  it('includes department and signed range', () => {
    const qs = buildRelatedWorksSearchQueryString(11, 950, 1050);
    expect(qs).toContain('departmentId=11');
    expect(qs).toContain('dateBegin=950');
    expect(qs).toContain('dateEnd=1050');
    expect(qs).toContain('hasImages=true');
  });
});

describe('takeRelatedIdsExcluding', () => {
  it('drops self and respects limit', () => {
    expect(takeRelatedIdsExcluding([1, 2, 3, 4], 2, 2)).toEqual([1, 3]);
  });
});

describe('getRelatedWorksReadiness', () => {
  it('returns ok when department and dates resolve', () => {
    const depts = [{ departmentId: 11, displayName: 'European Paintings' }];
    const d = baseDetail({
      department: 'European Paintings',
      objectBeginDate: 1888,
      objectEndDate: 1890,
    });
    expect(getRelatedWorksReadiness(d, depts)).toEqual({
      status: 'ok',
      departmentId: 11,
      dateBegin: 1839,
      dateEnd: 1939,
    });
  });

  it('returns no-department when name does not match', () => {
    const depts = [{ departmentId: 1, displayName: 'Other Wing' }];
    expect(
      getRelatedWorksReadiness(baseDetail({ department: 'X' }), depts)
    ).toEqual({ status: 'no-department' });
  });

  it('returns no-date when year cannot be inferred', () => {
    const depts = [{ departmentId: 11, displayName: 'European Paintings' }];
    expect(
      getRelatedWorksReadiness(
        baseDetail({
          department: 'European Paintings',
          objectBeginDate: null,
          objectEndDate: null,
          structuredDate: null,
        }),
        depts
      )
    ).toEqual({ status: 'no-date' });
  });
});
