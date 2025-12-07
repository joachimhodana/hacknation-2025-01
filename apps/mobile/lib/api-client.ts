import { authClient } from "./auth-client";
import { Platform } from "react-native";

// Get base URL from environment variable or default to localhost
// This should match the auth client's base URL
const getBaseURL = () => {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_BETTER_AUTH_URL) {
    return process.env.EXPO_PUBLIC_BETTER_AUTH_URL;
  }
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  // For iOS simulator, localhost works fine
  // For physical devices, you need your computer's IP address
  if (Platform.OS === "android") {
    // Android emulator special IP
    return "http://10.0.2.2:8080";
  }
  
  // Default to localhost:8080 for iOS simulator and web
  return "http://localhost:8080";
};

export const API_BASE_URL = getBaseURL();

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

  // On native platforms, get session token from SecureStore and send as cookie
  try {
    const session = await authClient.getSession();
    if (session?.data?.session?.token) {
      // Better Auth expects the session token as a cookie
      const sessionToken = session.data.session.token;
      headers["Cookie"] = `better-auth.session_token=${sessionToken}`;
    }
  } catch (error) {
    // Silently fail - request will proceed without auth header
  }

  return headers;
}

export async function fetchUserStats(): Promise<UserStats | null> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/user/stats`, {
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
    const response = await fetch(`${API_BASE_URL}/user/paths`, {
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

