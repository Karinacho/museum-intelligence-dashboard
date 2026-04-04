import { describe, expect, it } from 'vitest';
import {
  buildMetSearchQueryString,
  isHighlightsMode,
  parseUrlGalleryFilters,
} from './resolveGallerySearch';

describe('parseUrlGalleryFilters', () => {
  it('returns empty object when no params', () => {
    expect(parseUrlGalleryFilters(new URLSearchParams())).toEqual({});
  });

  it('parses dept, dates, and keyword', () => {
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
});

describe('isHighlightsMode', () => {
  it('is true only for default empty search', () => {
    expect(isHighlightsMode({})).toBe(true);
    expect(isHighlightsMode({ keyword: '' })).toBe(true);
    expect(isHighlightsMode({ keyword: '   ' })).toBe(true);
    expect(isHighlightsMode({ departmentId: 1 })).toBe(false);
    expect(isHighlightsMode({ dateBegin: -100 })).toBe(false);
    expect(isHighlightsMode({ keyword: 'vase' })).toBe(false);
  });
});

describe('buildMetSearchQueryString', () => {
  it('adds highlights flags when in default mode', () => {
    const qs = buildMetSearchQueryString({});
    expect(qs).toContain('q=*');
    expect(qs).toContain('hasImages=true');
    expect(qs).toContain('isHighlight=true');
  });

  it('omits isHighlight when user filters are active', () => {
    const qs = buildMetSearchQueryString({ departmentId: 10 });
    expect(qs).toContain('departmentId=10');
    expect(qs).not.toContain('isHighlight');
    expect(qs).toContain('q=*');
  });

  it('uses keyword as q when provided', () => {
    const qs = buildMetSearchQueryString({ keyword: 'limestone' });
    expect(qs).toContain('q=limestone');
    expect(qs).not.toContain('isHighlight');
  });
});
