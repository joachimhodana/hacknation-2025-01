import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Get base URL from environment variable or default to localhost
const getBaseURL = () => {
  // Use platform-specific environment variables
  if (Platform.OS === "web") {
    if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_BETTER_AUTH_URL_WEB) {
      return process.env.EXPO_PUBLIC_BETTER_AUTH_URL_WEB;
    }
    // Default for web
    return "http://localhost:8080";
  } else {
    // Native platforms (iOS, Android)
    if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_BETTER_AUTH_URL_NATIVE) {
      return process.env.EXPO_PUBLIC_BETTER_AUTH_URL_NATIVE;
    }
    
    // Fallback defaults for native
    if (Platform.OS === "android") {
      // Android emulator special IP
      return "http://10.0.2.2:8080";
    }
    
    // Default for iOS simulator
    return "http://localhost:8080";
  }
};

// Configure auth client based on platform
// On web, Better Auth works with standard React client (no expoClient needed)
// On native, we need expoClient with SecureStore
const getAuthClientConfig = () => {
  const baseConfig = {
    baseURL: getBaseURL(),
  };

  if (Platform.OS === "web") {
    // On web, don't use expoClient - Better Auth will use localStorage/cookies automatically
    return baseConfig;
  } else {
    // On native platforms, use expoClient with SecureStore
    return {
      ...baseConfig,
      plugins: [
        expoClient({
          scheme: "mobile",
          storagePrefix: "mobile",
          storage: SecureStore,
        }),
      ],
    };
  }
};

export const authClient = createAuthClient(getAuthClientConfig());

