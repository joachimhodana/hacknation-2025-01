import { Platform } from "react-native";
// Import api-url FIRST to avoid circular dependency
// auth-client depends on api-url, so we need it loaded first
import { getAPIBaseURL } from "./api-url";
import { authClient } from "./auth-client";

// Re-export for convenience
export { getAPIBaseURL };

export interface UserStats {
  completionPercentage: number;
  completedPathsCount: number;
  totalPublishedPaths: number;
  totalDistanceMeters: number;
  totalDistanceKm: number;
  collectedItemsCount: number;
  collectedItems: CollectedItem[];
  allRewards?: Reward[]; // All available rewards with collected status
}

export interface CollectedItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  collected: boolean;
  placeName?: string;
  collectedAt?: string;
  rewardIconUrl?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  rewardIconUrl?: string;
  collected: boolean;
  pointId: number;
}

// Helper function to get auth headers for API requests
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (Platform.OS === "web") {
    // On web, Better Auth uses cookies automatically
    return headers;
  }

  // On native platforms, get cookies from SecureStore using getCookie()
  // getCookie() is available when expoClient plugin is used (native only)
  try {
    const cookies = (authClient as any).getCookie?.();
    if (cookies) {
      headers["Cookie"] = cookies;
    }
  } catch (error) {
    // Silently fail - request will proceed without auth header
  }

  return headers;
}

export async function fetchUserStats(): Promise<UserStats | null> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/stats`;
    
    if (__DEV__) {
      console.log("[API] fetchUserStats - Base URL:", baseURL);
      console.log("[API] fetchUserStats - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "GET",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    if (!response.ok) {
      console.error("[API] Failed to fetch user stats:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("[API] Error fetching user stats:", error);
    return null;
  }
}

export interface Path {
  id: number;
  pathId: string;
  title: string;
  theme: string;
  category: string;
  total_time_minutes: number;
  difficulty: string;
  distance_meters?: number | null;
  thumbnail_url?: string | null;
  marker_icon_url?: string | null;
  style_preset?: string | null;
  stops: Array<{
    stop_id: number;
    name: string;
    map_marker: {
      display_name: string;
      address: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    place_description: string;
    voice_over_text: string;
  }>;
}

export interface PathProgress {
  progress: {
    id: number;
    status: string;
    visitedStopsCount: number;
    lastVisitedStopOrder: number | null;
    startedAt: string;
  };
  path: {
    id: number;
    pathId: string;
    title: string;
    theme: string;
    category: string;
    total_time_minutes: number;
    difficulty: string;
    distance_meters?: number | null;
    thumbnail_url?: string | null;
    marker_icon_url?: string | null;
    style_preset?: string | null;
    stops: Array<{
      stop_id: number;
      point_id: number;
      name: string;
      map_marker: {
        display_name: string;
        address: string;
        coordinates: {
          latitude: number;
          longitude: number;
        };
      };
      place_description: string;
      voice_over_text: string;
      radius_meters: number;
      reward_label?: string | null;
      reward_icon_url?: string | null;
      audio_url?: string | null;
      visited: boolean;
      character?: {
        id: number;
        name: string;
        avatarUrl: string;
        description: string;
      } | null;
    }>;
  };
}

export async function fetchPaths(): Promise<Path[] | null> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/paths`;
    
    if (__DEV__) {
      console.log("[API] fetchPaths - Base URL:", baseURL);
      console.log("[API] fetchPaths - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "GET",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    if (!response.ok) {
      console.error("[API] Failed to fetch paths:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("[API] Error fetching paths:", error);
    return null;
  }
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

export async function fetchLeaderboard(): Promise<LeaderboardData | null> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/leaderboard`;
    
    if (__DEV__) {
      console.log("[API] fetchLeaderboard - Base URL:", baseURL);
      console.log("[API] fetchLeaderboard - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "GET",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    if (!response.ok) {
      console.error("[API] Failed to fetch leaderboard:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("[API] Error fetching leaderboard:", error);
    return null;
  }
}

export async function startPath(pathId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/paths/${pathId}/start`;
    
    if (__DEV__) {
      console.log("[API] startPath - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "POST",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("[API] Failed to start path:", data.error || response.status);
      return {
        success: false,
        error: data.error || "Failed to start path",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[API] Error starting path:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start path",
    };
  }
}

export async function pausePath(pathId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/paths/${pathId}/pause`;
    
    if (__DEV__) {
      console.log("[API] pausePath - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "POST",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("[API] Failed to pause path:", data.error || response.status);
      return {
        success: false,
        error: data.error || "Failed to pause path",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[API] Error pausing path:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pause path",
    };
  }
}

export async function getActivePathProgress(): Promise<PathProgress | null> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/paths/progress`;
    
    if (__DEV__) {
      console.log("[API] getActivePathProgress - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "GET",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    if (!response.ok) {
      console.error("[API] Failed to fetch active path progress:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success) {
      // If no active path, data.data will be null
      return data.data || null;
    }

    return null;
  } catch (error) {
    console.error("[API] Error fetching active path progress:", error);
    return null;
  }
}

export async function fetchAllRewards(): Promise<Reward[] | null> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/rewards`;
    
    if (__DEV__) {
      console.log("[API] fetchAllRewards - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "GET",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    if (!response.ok) {
      console.error("[API] Failed to fetch all rewards:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data.rewards;
    }

    return null;
  } catch (error) {
    console.error("[API] Error fetching all rewards:", error);
    return null;
  }
}

export async function markPointVisited(
  pointId: number,
  pathProgressId: number
): Promise<{ success: boolean; isCompleted?: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/paths/progress/visit`;
    
    if (__DEV__) {
      console.log("[API] markPointVisited - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "POST",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
      body: JSON.stringify({
        pointId,
        pathProgressId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("[API] Failed to mark point as visited:", data.error || response.status);
      return {
        success: false,
        error: data.error || "Failed to mark point as visited",
      };
    }

    return {
      success: true,
      isCompleted: data.data?.isCompleted || false,
    };
  } catch (error) {
    console.error("[API] Error marking point as visited:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark point as visited",
    };
  }
}

export interface PublicPoint {
  point_id: number;
  name: string;
  map_marker: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  place_description: string;
  radius_meters: number;
  reward_label?: string | null;
  reward_icon_url?: string | null;
  audio_url?: string | null;
  character: {
    id: number;
    name: string;
    avatarUrl: string;
    description: string;
  } | null;
}

export async function fetchPublicPoints(): Promise<PublicPoint[] | null> {
  try {
    const headers = await getAuthHeaders();
    const baseURL = getAPIBaseURL();
    const fullURL = `${baseURL}/user/points/public`;
    
    if (__DEV__) {
      console.log("[API] fetchPublicPoints - Full URL:", fullURL);
    }

    const response = await fetch(fullURL, {
      method: "GET",
      headers,
      credentials: Platform.OS === "web" ? "include" : "omit",
    });

    if (!response.ok) {
      console.error("[API] Failed to fetch public points:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("[API] Error fetching public points:", error);
    return null;
  }
}

