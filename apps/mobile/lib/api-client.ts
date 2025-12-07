import { authClient } from "./auth-client";

const API_BASE_URL = "http://localhost:8080";

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

export async function fetchUserStats(): Promise<UserStats | null> {
  try {
    const cookies = authClient.getCookie();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const response = await fetch(`${API_BASE_URL}/user/stats`, {
      method: "GET",
      headers,
      credentials: "omit", // We're manually setting cookies
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

