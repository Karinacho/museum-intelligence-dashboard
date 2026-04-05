/**
 * Raw response from /objects endpoint
 */
export interface MetObjectsResponse {
  total: number;
  objectIDs: number[];
}

/**
 * Raw response from /objects/{id} endpoint
 */
export interface MetObjectResponse {
  objectID: number;
  isHighlight: boolean;
  accessionNumber: string;
  accessionYear: string;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string;
  additionalImages: string[];
  constituents: Constituent[] | null;
  department: string;
  objectName: string;
  title: string;
  culture: string;
  period: string;
  dynasty: string;
  reign: string;
  portfolio: string;
  artistRole: string;
  artistPrefix: string;
  artistDisplayName: string;
  artistDisplayBio: string;
  artistSuffix: string;
  artistAlphaSort: string;
  artistNationality: string;
  artistBeginDate: string;
  artistEndDate: string;
  artistGender: string;
  artistWikidata_URL: string;
  artistULAN_URL: string;
  objectDate: string;
  objectBeginDate: number;
  objectEndDate: number;
  medium: string;
  dimensions: string;
  measurements: Measurement[] | null;
  creditLine: string;
  geographyType: string;
  city: string;
  state: string;
  county: string;
  country: string;
  region: string;
  subregion: string;
  locale: string;
  locus: string;
  excavation: string;
  river: string;
  classification: string;
  rightsAndReproduction: string;
  linkResource: string;
  metadataDate: string;
  repository: string;
  objectURL: string;
  tags: Tag[] | null;
  objectWikidata_URL: string;
  isTimelineWork: boolean;
  GalleryNumber: string;
}

interface Constituent {
  constituentID: number;
  role: string;
  name: string;
  constituentULAN_URL: string;
  constituentWikidata_URL: string;
  gender: string;
}

interface Measurement {
  elementName: string;
  elementDescription: string;
  elementMeasurements: {
    Height: number;
    Width: number;
  };
}

interface Tag {
  term: string;
  AAT_URL: string;
  Wikidata_URL: string;
}

export type ArtworkStructuredDate = {
  year: number;
  era: 'BCE' | 'CE';
};

/**
 * Normalized artwork model for gallery card display
 */
export interface ArtworkCard {
  id: number;
  title: string;
  artist: string;
  /** Human-readable date for the card (prefers API objectDate when present). */
  dateLine: string;
  structuredDate: ArtworkStructuredDate | null;
  imageUrl: string | null;
}

/**
 * Full artwork model for detail view
 */
export interface ArtworkDetail extends ArtworkCard {
  accessionNumber: string;
  medium: string;
  dimensions: string;
  tags: string[];
  creditLine: string;
  department: string;
  culture: string;
  period: string;
  primaryImageLarge: string | null;
  objectBeginDate: number | null;
  objectEndDate: number | null;
  /** Public object page on metmuseum.org when provided. */
  objectUrl: string | null;
}

export function parseDateFromObjectDateString(
  objectDate: string | undefined | null
): ArtworkStructuredDate | null {
  if (!objectDate?.trim()) return null;
  const s = objectDate.trim();

  const bc = s.match(/(\d{1,4})\s*(?:B\.?C\.?(?:E\.?)?|BCE)/i);
  if (bc) {
    const year = Number.parseInt(bc[1] ?? '', 10);
    if (!Number.isNaN(year)) return { year, era: 'BCE' };
  }

  const ce = s.match(/(\d{1,4})\s*(?:C\.?E\.?|CE|A\.?D\.?)/i);
  if (ce) {
    const year = Number.parseInt(ce[1] ?? '', 10);
    if (!Number.isNaN(year)) return { year, era: 'CE' };
  }

  const plain = s.match(/^(-?\d{1,4})$/);
  if (plain) {
    const n = Number.parseInt(plain[1] ?? '', 10);
    if (!Number.isNaN(n)) {
      if (n < 0) return { year: Math.abs(n), era: 'BCE' };
      return { year: n, era: 'CE' };
    }
  }

  return null;
}

export function extractStructuredDate(
  raw: MetObjectResponse
): ArtworkStructuredDate | null {
  const begin = raw.objectBeginDate;
  if (typeof begin === 'number' && begin !== 0 && !Number.isNaN(begin)) {
    if (begin < 0) return { year: Math.abs(begin), era: 'BCE' };
    return { year: begin, era: 'CE' };
  }

  const end = raw.objectEndDate;
  if (typeof end === 'number' && end !== 0 && !Number.isNaN(end)) {
    if (end < 0) return { year: Math.abs(end), era: 'BCE' };
    return { year: end, era: 'CE' };
  }

  return parseDateFromObjectDateString(raw.objectDate);
}

export function formatArtworkDateLine(
  structured: ArtworkStructuredDate | null,
  objectDate: string | undefined | null
): string {
  const od = objectDate?.trim();
  if (od) return od;
  if (structured) return `${structured.year} ${structured.era}`;
  return 'Date unknown';
}

/**
 * Normalize a raw /objects/{id} payload for UI consumption.
 */
export const transformArtwork = (
  response: MetObjectResponse
): ArtworkCard | null => {
  if (response.objectID == null) return null;

  const structuredDate = extractStructuredDate(response);
  const dateLine = formatArtworkDateLine(structuredDate, response.objectDate);

  return {
    id: response.objectID,
    title: response.title?.trim() || 'Untitled',
    artist: response.artistDisplayName?.trim() || 'Unknown artist',
    dateLine,
    structuredDate,
    imageUrl: response.primaryImageSmall?.trim() || null,
  };
};

/** @deprecated Use transformArtwork */
export const toArtworkCard = transformArtwork;

/**
 * Transform Met API response to ArtworkDetail
 */
export const toArtworkDetail = (
  response: MetObjectResponse
): ArtworkDetail | null => {
  const card = transformArtwork(response);
  if (!card) return null;

  return {
    ...card,
    accessionNumber: response.accessionNumber?.trim() || '—',
    medium: response.medium?.trim() || 'Not specified',
    dimensions: response.dimensions?.trim() || 'Not specified',
    tags: response.tags?.map((tag) => tag.term).filter(Boolean) ?? [],
    creditLine: response.creditLine?.trim() || '—',
    department: response.department?.trim() || 'Unknown',
    culture: response.culture?.trim() || 'Unknown',
    period: response.period?.trim() || 'Unknown',
    primaryImageLarge: response.primaryImage?.trim() || null,
    objectBeginDate:
      typeof response.objectBeginDate === 'number' &&
      !Number.isNaN(response.objectBeginDate)
        ? response.objectBeginDate
        : null,
    objectEndDate:
      typeof response.objectEndDate === 'number' &&
      !Number.isNaN(response.objectEndDate)
        ? response.objectEndDate
        : null,
    objectUrl: response.objectURL?.trim() || null,
  };
};
