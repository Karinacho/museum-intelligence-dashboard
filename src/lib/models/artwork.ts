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

/**
 * Normalized artwork model for gallery card display
 */
export interface ArtworkCard {
  id: number;
  title: string;
  artist: string;
  date: string;
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
}

/**
 * Transform Met API response to ArtworkCard
 */
export const toArtworkCard = (
  response: MetObjectResponse
): ArtworkCard | null => {
  // Skip objects without basic display data
  if (!response.objectID || !response.title) {
    return null;
  }

  return {
    id: response.objectID,
    title: response.title || 'Untitled',
    artist: response.artistDisplayName || 'Unknown Artist',
    date: response.objectDate || 'Date Unknown',
    imageUrl: response.primaryImageSmall || null,
  };
};

/**
 * Transform Met API response to ArtworkDetail
 */
export const toArtworkDetail = (
  response: MetObjectResponse
): ArtworkDetail | null => {
  const card = toArtworkCard(response);
  if (!card) return null;

  return {
    ...card,
    accessionNumber: response.accessionNumber || 'N/A',
    medium: response.medium || 'Not specified',
    dimensions: response.dimensions || 'Not specified',
    tags: response.tags?.map((tag) => tag.term) || [],
    creditLine: response.creditLine || 'N/A',
    department: response.department || 'Unknown',
    culture: response.culture || 'Unknown',
    period: response.period || 'Unknown',
    primaryImageLarge: response.primaryImage || null,
    objectBeginDate: response.objectBeginDate || null,
    objectEndDate: response.objectEndDate || null,
  };
};
