import React from "react";
<<<<<<< Updated upstream
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
=======
import { Platform, Text, View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppleMaps, GoogleMaps } from 'expo-maps';

const { height } = Dimensions.get("window");

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  textDark: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
};

const BYDGOSZCZ_COORDS = {
  latitude: 53.1235,
  longitude: 18.0084,
};

export default function MapScreen() {
  const cameraPosition = {
    coordinates: BYDGOSZCZ_COORDS,
    zoom: 15, // 14–16 is a nice city-level zoom
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* background blobs */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mapa miasta</Text>
          <Text style={styles.subtitle}>
            Wybierz misję, podejdź do punktu i odblokuj kolejne zadania.
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapWrapper}>
          {Platform.OS === "ios" ? (
            <AppleMaps.View
              style={styles.map}
              cameraPosition={cameraPosition}
              markers={[
                {
                  id: "museum-1",
                  coordinates: BYDGOSZCZ_COORDS,
                  title: "Muzeum",
                  tintColor: COLORS.red,
                  systemImage: "building.columns", // SF Symbol on iOS
                },
              ]}
              properties={{
                isMyLocationEnabled: true,
                mapType: AppleMaps.MapType.STANDARD,
              }}
              uiSettings={{
                compassEnabled: true,
                myLocationButtonEnabled: false,
                togglePitchEnabled: true,
              }}
            />
          ) : Platform.OS === "android" ? (
            <GoogleMaps.View
              style={styles.map}
              cameraPosition={cameraPosition}
              markers={[
                {
                  id: "museum-1",
                  coordinates: BYDGOSZCZ_COORDS,
                  title: "Muzeum",
                  snippet: "Przykładowa misja",
                  showCallout: true,
                },
              ]}
              properties={{
                isMyLocationEnabled: true,
                isBuildingEnabled: true,
              }}
              uiSettings={{
                compassEnabled: true,
                myLocationButtonEnabled: false,
                zoomGesturesEnabled: true,
              }}
            />
          ) : (
            // Web fallback – expo-maps is native-only
            <View style={styles.webFallback}>
              <Text style={styles.webFallbackText}>
                Mapy są dostępne tylko na urządzeniach mobilnych (iOS / Android
                build).
              </Text>
            </View>
          )}
        </View>

        {/* Bottom quest / HUD card */}
        <View style={styles.bottomCardWrapper}>
          <View className="accent-strip" style={styles.accentStrip}>
            <View
              style={[styles.accentSegment, { backgroundColor: COLORS.red }]}
            />
            <View
              style={[styles.accentSegment, { backgroundColor: COLORS.yellow }]}
            />
            <View
              style={[styles.accentSegment, { backgroundColor: COLORS.blue }]}
            />
          </View>

          <View style={styles.bottomCard}>
            <Text style={styles.cardTitle}>Najbliższa misja</Text>
            <Text style={styles.cardSubtitle}>
              Lorem ipsum dolor sit amet, tu później wrzucisz opis zadania:
              gdzie pójść, co przeczytać albo co zeskanować.
            </Text>

            <View style={styles.cardRow}>
              <View style={styles.pill}>
                <View
                  style={[styles.dot, { backgroundColor: COLORS.red }]}
                />
                <Text style={styles.pillText}>~ 250 m</Text>
              </View>
              <View style={styles.pill}>
                <View
                  style={[styles.dot, { backgroundColor: COLORS.blue }]}
                />
                <Text style={styles.pillText}>Muzeum / punkt kultury</Text>
              </View>
            </View>

            <Text style={styles.cardHint}>
              Zbliż się do punktu na mapie, żeby rozpocząć misję. Potem możemy
              tu wrzucić przycisk „Start misji”.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const MAP_HEIGHT = height * 0.6;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  container: {
    flex: 1,
  },

  // blobs
  blob: {
    position: "absolute",
    opacity: 0.22,
    borderRadius: 999,
  },
  blobRed: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.red,
    top: -60,
    right: -80,
  },
  blobBlue: {
    width: 180,
    height: 180,
    backgroundColor: COLORS.blue,
    top: 120,
    left: -60,
  },
  blobYellow: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.yellow,
    bottom: 40,
    right: -40,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  mapWrapper: {
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    height: MAP_HEIGHT,
    backgroundColor: "#D1D5DB",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  webFallbackText: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 13,
  },

  bottomCardWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  accentStrip: {
    flexDirection: "row",
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  accentSegment: {
    flex: 1,
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    color: COLORS.textDark,
  },
  cardHint: {
    marginTop: 10,
    fontSize: 11,
    color: COLORS.textMuted,
>>>>>>> Stashed changes
  },
});
