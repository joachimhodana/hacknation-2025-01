import React from "react";
import { Platform, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppleMaps, GoogleMaps } from 'expo-maps';

// Default coordinates (Bydgoszcz, Poland)
const DEFAULT_COORDS = {
  latitude: 53.1235,
  longitude: 18.0084,
};

export default function MapScreen() {
  const cameraPosition = {
    coordinates: DEFAULT_COORDS,
    zoom: 15,
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "ios" ? (
        <AppleMaps.View
          style={styles.map}
          cameraPosition={cameraPosition}
          properties={{
            isMyLocationEnabled: true,
            mapType: AppleMaps.MapType.STANDARD,
          }}
          uiSettings={{
            compassEnabled: true,
            myLocationButtonEnabled: true,
            togglePitchEnabled: true,
            zoomGesturesEnabled: true,
            scrollGesturesEnabled: true,
            rotateGesturesEnabled: true,
          }}
        />
      ) : Platform.OS === "android" ? (
        <GoogleMaps.View
          style={styles.map}
          cameraPosition={cameraPosition}
          properties={{
            isMyLocationEnabled: true,
            isBuildingEnabled: true,
          }}
          uiSettings={{
            compassEnabled: true,
            myLocationButtonEnabled: true,
            zoomGesturesEnabled: true,
            scrollGesturesEnabled: true,
            rotateGesturesEnabled: true,
            tiltGesturesEnabled: true,
          }}
        />
      ) : (
        // Web fallback – expo-maps is native-only
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>
            Maps are only available on mobile devices (iOS / Android build).
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F3F4F6",
  },
  webFallbackText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
  },
});
