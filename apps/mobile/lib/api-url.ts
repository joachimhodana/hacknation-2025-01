import { Platform } from "react-native";
import Constants from "expo-constants";

// API port - can be overridden via env
const API_PORT = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_PORT
  ? parseInt(process.env.EXPO_PUBLIC_API_PORT, 10)
  : 8080;

// Simple, reliable base URL - auto-detects origin and uses API port
export const getAPIBaseURL = () => {
  // Try to read from env first (for explicit override)
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

  // If env URL is explicitly set, use it
  if (envUrl) {
    if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
      try {
        const url = new URL(envUrl);
        if (__DEV__) {
          console.log("[API] Using env URL:", url.origin);
        }
        return url.origin;
      } catch (e) {
        console.warn("[API] Invalid env URL, falling back to auto-detection:", envUrl);
      }
    }
  }

  // Auto-detect origin based on platform
  if (Platform.OS === "web") {
    // On web, use window.location.origin and change port
    if (typeof window !== "undefined" && window.location) {
      const origin = window.location.origin;
      const url = new URL(origin);
      url.port = API_PORT.toString();
      if (__DEV__) {
        console.log("[API] Auto-detected web origin:", url.origin);
      }
      return url.origin;
    }
  } else {
    // On native, try to use Expo dev server host
    // Constants.expoConfig?.hostUri gives us something like "192.168.1.100:8081"
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      // Extract hostname/IP from hostUri (format: "192.168.1.100:8081" or "localhost:8081")
      const [hostname] = hostUri.split(":");
      const apiUrl = `http://${hostname}:${API_PORT}`;
      if (__DEV__) {
        console.log("[API] Auto-detected native origin from Expo hostUri:", apiUrl);
      }
      return apiUrl;
    }

    // Fallback: try to use Constants.executionEnvironment and manifest
    // In development, Constants.manifest2?.extra?.expoGo?.debuggerHost might be available
    const manifest = Constants.manifest2 || Constants.manifest;
    if (manifest && typeof manifest === 'object') {
      const extra = (manifest as any).extra;
      if (extra?.expoGo?.debuggerHost) {
        const [hostname] = extra.expoGo.debuggerHost.split(":");
        const apiUrl = `http://${hostname}:${API_PORT}`;
        if (__DEV__) {
          console.log("[API] Auto-detected native origin from manifest:", apiUrl);
        }
        return apiUrl;
      }
    }
  }

  // Final fallback to platform-specific defaults
  const defaults = {
    web: `http://localhost:${API_PORT}`,
    android: `http://10.0.2.2:${API_PORT}`, // Android emulator
    ios: `http://localhost:${API_PORT}`,
  };

  const defaultUrl = Platform.OS === "web" 
    ? defaults.web
    : Platform.OS === "android"
    ? defaults.android
    : defaults.ios;

  if (__DEV__) {
    console.log("[API] Using fallback default URL:", defaultUrl, "for platform:", Platform.OS);
  }

  return defaultUrl;
};

