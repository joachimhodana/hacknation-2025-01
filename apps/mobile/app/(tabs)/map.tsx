import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Map from "@/components/Map/Map";

// Default coordinates (Bydgoszcz, Poland)
const DEFAULT_COORDS = {
  lat: 53.1235,
  lng: 18.0084,
  zoom: 15,
};

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Map lat={DEFAULT_COORDS.lat} lng={DEFAULT_COORDS.lng} zoom={DEFAULT_COORDS.zoom} />
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
