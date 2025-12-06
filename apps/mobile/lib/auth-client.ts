import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// Get base URL from environment variable or default to localhost
const getBaseURL = () => {
  // For Expo, we can use Constants.expoConfig?.extra?.apiUrl or environment variable
  // Default to localhost for development
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_BETTER_AUTH_URL) {
    return process.env.EXPO_PUBLIC_BETTER_AUTH_URL;
  }
  // Default to localhost:8080 for development
  return "http://localhost:8080";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "mobile",
      storage: SecureStore,
    }),
  ],
});

