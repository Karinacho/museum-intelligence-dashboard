const MET_API_BASE_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1';

/**
 * Base HTTP client for Met Museum API
 */
class MetMuseumClient {
  private baseUrl: string;

  constructor(baseUrl: string = MET_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic GET request handler with error handling
   */
  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Met API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from Met API: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching from Met API');
    }
  }
}

export const metClient = new MetMuseumClient();
