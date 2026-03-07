/**
 * Data fetching service for Stitch Project 56802720016140995
 * Project Name: Circular Economy Gear Exchange
 */

export interface StitchScreen {
    name: string;
    title?: string;
    screenshot?: {
        name: string;
        downloadUrl: string;
    };
    htmlCode?: {
        name: string;
        downloadUrl: string;
        mimeType: string;
    };
    width?: string;
    height?: string;
    deviceType?: string;
}

export interface ListScreensResponse {
    screens: StitchScreen[];
}

export class StitchService {
    private readonly baseUrl = 'https://stitch.googleapis.com/v1';
    private readonly projectId: string;
    private readonly apiKey: string;

    constructor(apiKey?: string, projectId: string = '56802720016140995') {
        this.projectId = projectId;
        // You can also use the key from mcp_config.json: AQ.Ab8RN6Jkua8KBd0OWamaskkejeSoQJpry2h5C77n0hzgnNoOQw
        this.apiKey = apiKey || process.env.STITCH_API_KEY || '';
        if (!this.apiKey) {
            console.warn('Stitch API Key is not set. Ensure STITCH_API_KEY is an environment variable.');
        }
    }

    /**
     * Fetches all screens for the specified Stitch project.
     */
    async getScreens(): Promise<StitchScreen[]> {
        const url = `${this.baseUrl}/projects/${this.projectId}/screens`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch Stitch screens: ${response.status} ${response.statusText}`);
            }

            const data: ListScreensResponse = await response.json();
            return data.screens || [];
        } catch (error) {
            console.error('Error fetching Stitch screens:', error);
            throw error;
        }
    }

    /**
     * Fetches the code or asset payload from a specific download URL (e.g. from htmlCode.downloadUrl)
     */
    async fetchAssetContent(downloadUrl: string): Promise<string> {
        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch asset from URL: ${response.status} ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error fetching asset content:', error);
            throw error;
        }
    }

    /**
     * Utility method to get a screen by its title
     */
    async getScreenByTitle(title: string): Promise<StitchScreen | undefined> {
        const screens = await this.getScreens();
        return screens.find(screen => screen.title === title);
    }
}
