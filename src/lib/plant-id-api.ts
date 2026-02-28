/**
 * Plant.id API v3 Integration
 * https://web.plant.id/plant-identification-api/
 *
 * Uses the Plant.id API for AI-powered plant identification from images.
 * API key can be set via VITE_PLANT_ID_API_KEY env var or localStorage.
 */

const API_URL = 'https://plant.id/api/v3/identification';
const STORAGE_KEY = 'plant-id-api-key';

export interface PlantIdSuggestion {
  name: string;
  probability: number;
  details?: {
    url?: string;
    common_names?: string[];
    description?: { value: string };
    taxonomy?: {
      genus: string;
      family: string;
      order: string;
    };
    image?: { value: string };
  };
}

export interface PlantIdResult {
  is_plant: boolean;
  is_plant_probability: number;
  suggestions: PlantIdSuggestion[];
}

export interface PlantIdError {
  message: string;
  code?: string;
}

/** Get the configured API key */
export function getApiKey(): string | null {
  // Env var takes priority
  const envKey = import.meta.env.VITE_PLANT_ID_API_KEY;
  if (envKey && envKey !== 'your-plant-id-key') return envKey;
  // Fallback to localStorage
  return localStorage.getItem(STORAGE_KEY);
}

/** Save API key to localStorage */
export function setApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Check if Plant.id API is configured */
export function isPlantIdConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Identify a plant using Plant.id API.
 *
 * @param imageBase64 - Base64-encoded image data (with or without data URI prefix)
 * @returns PlantIdResult with suggestions
 * @throws Error if API key is missing or request fails
 */
export async function identifyWithPlantId(imageBase64: string): Promise<PlantIdResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Plant.id API-Key nicht konfiguriert. Bitte in den Einstellungen hinterlegen.');
  }

  // Strip data URI prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await fetch(
    `${API_URL}?details=common_names,taxonomy,url,description,image`,
    {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [base64Data],
        similar_images: true,
      }),
    }
  );

  if (!response.ok) {
    const status = response.status;
    if (status === 401) {
      throw new Error('Ungültiger API-Key. Bitte überprüfe deinen Plant.id API-Key.');
    }
    if (status === 429) {
      throw new Error('API-Limit erreicht. Bitte versuche es später erneut.');
    }
    if (status === 402) {
      throw new Error('Keine API-Credits mehr. Bitte lade deinen Plant.id Account auf.');
    }
    throw new Error(`Plant.id API Fehler (${status}). Bitte versuche es erneut.`);
  }

  const data = await response.json();
  const result = data.result;

  if (!result) {
    throw new Error('Unerwartete API-Antwort. Bitte versuche es erneut.');
  }

  return {
    is_plant: result.is_plant?.binary ?? false,
    is_plant_probability: result.is_plant?.probability ?? 0,
    suggestions: (result.classification?.suggestions || []).map((s: any) => ({
      name: s.name,
      probability: s.probability,
      details: s.details
        ? {
            url: s.details.url,
            common_names: s.details.common_names,
            description: s.details.description,
            taxonomy: s.details.taxonomy,
            image: s.details.image,
          }
        : undefined,
    })),
  };
}
