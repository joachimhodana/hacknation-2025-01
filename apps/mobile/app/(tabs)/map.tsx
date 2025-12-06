import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Map from "@/components/Map/Map";

export default function MapScreen() {
  // Map will automatically center on user's location
  // Coordinates are optional fallback
  return (
    <View style={styles.container}>
      <Map />
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
});
