import React, { useEffect } from "react";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Map from "@/components/Map/Map";
import Navbar from "@/components/Navbar";
import { PointsBadge } from "@/components/PointsBadge";
import { authClient } from "@/lib/auth-client";

export default function MapScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      console.log("[Map] No session found, redirecting to /");
      router.replace("/");
    } else if (session) {
      console.log("[Map] Session found:", session.user?.email || session.user?.id);
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ED1C24" />
      </View>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  // Map will automatically center on user's location
  // Coordinates are optional fallback
  return (
    <View style={styles.container}>
      <Map />
      <PointsBadge showIcon={true} />
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === "web"
      ? { height: "100vh", width: "100vw" }
      : {}),
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
