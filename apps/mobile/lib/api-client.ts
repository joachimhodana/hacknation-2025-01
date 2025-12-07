import { authClient } from "./auth-client";
import { Platform } from "react-native";

// Simple, reliable base URL - no complex logic
export const getAPIBaseURL = () => {
  // Default URLs per platform
  const defaults = {
    web: "http://localhost:8080",
    android: "http://10.0.2.2:8080", // Android emulator
    ios: "http://localhost:8080",
    default: "http://localhost:8080",
  };

  // Try to read from env, but validate it's actually a proper URL
  let envUrl: string | null = null;
  
  if (Platform.OS === "web") {
    envUrl = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_BETTER_AUTH_URL_WEB
      ? process.env.EXPO_PUBLIC_BETTER_AUTH_URL_WEB.trim()
      : null;
  } else {
    envUrl = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_BETTER_AUTH_URL_NATIVE
      ? process.env.EXPO_PUBLIC_BETTER_AUTH_URL_NATIVE.trim()
      : null;
  }

  // Validate env URL - must be a proper full URL
  if (envUrl) {
    // Must start with http:// or https:// and be a valid URL
    if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
      try {
        const url = new URL(envUrl);
        const result = url.origin;
        if (__DEV__) {
          console.log("[API] Using env URL:", result);
        }
        return result;
      } catch (e) {
        console.warn("[API] Invalid env URL, using default:", envUrl);
      }
    } else {
      console.warn("[API] Env URL missing protocol, using default:", envUrl);
    }
  }

  // Use platform-specific default
  const defaultUrl = Platform.OS === "web" 
    ? defaults.web
    : Platform.OS === "android"
    ? defaults.android
    : defaults.ios;

  if (__DEV__) {
    console.log("[API] Using default URL:", defaultUrl, "for platform:", Platform.OS);
  }

  return defaultUrl;
};

// For backward compatibility, but prefer using getAPIBaseURL() directly
export const API_BASE_URL = getAPIBaseURL();

export interface UserStats {
  completionPercentage: number;
  completedPathsCount: number;
  totalPublishedPaths: number;
  totalDistanceMeters: number;
  totalDistanceKm: number;
  collectedItemsCount: number;
  collectedItems: CollectedItem[];
}

export interface CollectedItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  collected: boolean;
  placeName?: string;
  collectedAt?: string;
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

