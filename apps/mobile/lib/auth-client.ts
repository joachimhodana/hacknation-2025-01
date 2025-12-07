import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getAPIBaseURL } from "./api-url";

// Get base URL - reuse the same logic as API client for consistency
const getBaseURL = () => {
  return getAPIBaseURL();
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

