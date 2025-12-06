const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get auth token from session cookie
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  // Better Auth stores session in cookies, so we just need to include credentials
  return {
    'Accept': 'application/json',
  };
}


/**
 * Get all characters to map character names to IDs
 */
export async function getCharacters(): Promise<ApiResponse<any[]>> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/characters`, {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const result: ApiResponse<any[]> = await response.json();
  return result;
}

/**
 * Create a new path/route with points
 */
export async function createPath(data: {
  pathId: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  difficulty: string;
  totalTimeMinutes: number;
  distanceMeters: number;
  thumbnailFile: File;
  markerIconFile?: File;
  stylePreset?: string;
  points?: Array<{
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    locationLabel?: string;
    narrationText: string;
    characterId?: number;
    audioFile?: File;
    rewardLabel?: string;
    rewardIconUrl?: string;
  }>;
}): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('pathId', data.pathId);
  formData.append('title', data.title);
  formData.append('shortDescription', data.shortDescription);
  if (data.longDescription) {
    formData.append('longDescription', data.longDescription);
  }
  formData.append('category', data.category);
  formData.append('difficulty', data.difficulty);
  formData.append('totalTimeMinutes', data.totalTimeMinutes.toString());
  formData.append('distanceMeters', data.distanceMeters.toString());
  formData.append('thumbnailFile', data.thumbnailFile);
  if (data.markerIconFile) {
    formData.append('markerIconFile', data.markerIconFile);
  }
  if (data.stylePreset) {
    formData.append('stylePreset', data.stylePreset);
  }

  // Add points as JSON string
  if (data.points && data.points.length > 0) {
    // Prepare points data (without File objects, they'll be added separately)
    const pointsData = data.points.map((point, index) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      radiusMeters: point.radiusMeters || 50,
      locationLabel: point.locationLabel,
      narrationText: point.narrationText,
      characterId: point.characterId,
      rewardLabel: point.rewardLabel,
      rewardIconUrl: point.rewardIconUrl,
    }));
    
    formData.append('points', JSON.stringify(pointsData));

    // Add audio files with indices (audioFile_0, audioFile_1, etc.)
    data.points.forEach((point, index) => {
      if (point.audioFile) {
        formData.append(`audioFile_${index}`, point.audioFile);
      }
    });
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/paths`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  const result: ApiResponse<any> = await response.json();
  return result;
}

