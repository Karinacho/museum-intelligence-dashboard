import { describe, expect, it } from 'vitest';
import {
  parseDateFromObjectDateString,
  transformArtwork,
  type MetObjectResponse,
} from './artwork';

const minimalRaw = (over: Partial<MetObjectResponse>): MetObjectResponse =>
  ({
    objectID: 1,
    title: 'Test',
    artistDisplayName: 'Artist',
    objectDate: '',
    objectBeginDate: 0,
    objectEndDate: 0,
    primaryImageSmall: '',
    primaryImage: '',
    isHighlight: false,
    accessionNumber: '',
    accessionYear: '',
    isPublicDomain: true,
    additionalImages: [],
    constituents: null,
    department: '',
    objectName: '',
    culture: '',
    period: '',
    dynasty: '',
    reign: '',
    portfolio: '',
    artistRole: '',
    artistPrefix: '',
    artistDisplayBio: '',
    artistSuffix: '',
    artistAlphaSort: '',
    artistNationality: '',
    artistBeginDate: '',
    artistEndDate: '',
    artistGender: '',
    artistWikidata_URL: '',
    artistULAN_URL: '',
    medium: '',
    dimensions: '',
    measurements: null,
    creditLine: '',
    geographyType: '',
    city: '',
    state: '',
    county: '',
    country: '',
    region: '',
    subregion: '',
    locale: '',
    locus: '',
    excavation: '',
    river: '',
    classification: '',
    rightsAndReproduction: '',
    linkResource: '',
    metadataDate: '',
    repository: '',
    objectURL: '',
    tags: null,
    objectWikidata_URL: '',
    isTimelineWork: false,
    GalleryNumber: '',
    ...over,
  }) as MetObjectResponse;

describe('parseDateFromObjectDateString', () => {
  it('parses BCE and CE phrases', () => {
    expect(parseDateFromObjectDateString('500 BCE')).toEqual({
      year: 500,
      era: 'BCE',
    });
    expect(parseDateFromObjectDateString('1200 CE')).toEqual({
      year: 1200,
      era: 'CE',
    });
  });

  it('parses signed plain years', () => {
    expect(parseDateFromObjectDateString('-300')).toEqual({
      year: 300,
      era: 'BCE',
    });
    expect(parseDateFromObjectDateString('1776')).toEqual({
      year: 1776,
      era: 'CE',
    });
  });
});

describe('transformArtwork', () => {
  it('returns null without object id', () => {
    const raw = minimalRaw({ objectID: 1 });
    Reflect.deleteProperty(raw, 'objectID');
    expect(transformArtwork(raw as MetObjectResponse)).toBeNull();
  });

  it('fills defaults and prefers objectDate for display line', () => {
    const card = transformArtwork(
      minimalRaw({
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
    expect(card?.structuredDate).toEqual({ year: 1850, era: 'CE' });
  });

  it('uses structured date in dateLine when objectDate empty', () => {
    const card = transformArtwork(
      minimalRaw({
        objectID: 2,
        title: 'Jar',
        objectDate: '',
        objectBeginDate: -200,
      })
    );
    expect(card?.dateLine).toBe('200 BCE');
  });
});
