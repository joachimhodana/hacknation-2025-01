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
 * Create a new path/route
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
  // Note: totalTimeMinutes and distanceMeters might need to be added to backend endpoint
  // For now, we'll try to include them, but backend may ignore them
  formData.append('totalTimeMinutes', data.totalTimeMinutes.toString());
  formData.append('distanceMeters', data.distanceMeters.toString());
  formData.append('thumbnailFile', data.thumbnailFile);
  if (data.markerIconFile) {
    formData.append('markerIconFile', data.markerIconFile);
  }
  if (data.stylePreset) {
    formData.append('stylePreset', data.stylePreset);
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

/**
 * Create a point and optionally link it to a path
 */
export async function createPoint(data: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationLabel?: string;
  narrationText: string;
  fullNarrationText?: string;
  characterId?: number;
  audioUrl?: string;
  audioFile?: File;
  pathId?: number;
  orderIndex?: number;
}): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('latitude', data.latitude.toString());
  formData.append('longitude', data.longitude.toString());
  formData.append('radiusMeters', data.radiusMeters.toString());
  formData.append('narrationText', data.narrationText);
  
  if (data.locationLabel) {
    formData.append('locationLabel', data.locationLabel);
  }
  if (data.fullNarrationText) {
    formData.append('fullNarrationText', data.fullNarrationText);
  }
  if (data.characterId !== undefined) {
    formData.append('characterId', data.characterId.toString());
  }
  if (data.audioUrl) {
    formData.append('audioUrl', data.audioUrl);
  }
  if (data.audioFile) {
    formData.append('audioFile', data.audioFile);
  }
  if (data.pathId !== undefined) {
    formData.append('pathId', data.pathId.toString());
  }
  if (data.orderIndex !== undefined) {
    formData.append('orderIndex', data.orderIndex.toString());
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/points`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  const result: ApiResponse<any> = await response.json();
  return result;
}


