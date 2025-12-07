import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  Appearance,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Camera,
  Marker,
} from "react-native-maps";
import * as Location from "expo-location";
import { authClient } from "@/lib/auth-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_ALT = 120;
const MAX_ALT = 8000;
const ZOOM_STEP = 400;

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
};

type ActiveRoute = {
  title: string;
  totalStops: number;
  completedStops: number;
} | null;

export const Map: React.FC = () => {
  const colorScheme = Appearance.getColorScheme();
  const isDark = colorScheme === "dark";
  const { data: session } = authClient.useSession();
  const insets = useSafeAreaInsets();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );

  // 🔹 TU PODSTAWISZ REALNE DANE TRASY
  const activeRoute: ActiveRoute = {
    title: "Szlak Mariana Rejewskiego",
    totalStops: 8,
    completedStops: 3,
  };

  const hasRoute = !!activeRoute;
  const routeTitle = activeRoute?.title ?? "";
  const totalStops = activeRoute?.totalStops ?? 0;
  const completedStops = Math.min(
    activeRoute?.completedStops ?? 0,
    totalStops,
  );
  const progressRatio =
    totalStops > 0 ? completedStops / totalStops : 0;
  const progressText =
    totalStops > 0
      ? `${completedStops} / ${totalStops} przystanków`
      : "Brak przystanków na trasie";

  // User info for avatar
  const user = session?.user;
  const userName = user?.name as string | undefined;
  const userInitials = userName
    ? userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location denied");
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setUserLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch (e) {
        console.log("Error getting location", e);
      }

      try {
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          },
        );
      } catch (error) {
        console.error("Error watching location:", error);
      }
    })();

    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      const cam: Camera = {
        center: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        },
        pitch: 55,
        heading: 0,
        altitude: 600,
      };

      mapRef.current.animateCamera(cam, { duration: 500 });
    }
  }, [userLocation]);

  const normalizeAltitude = (rawAlt?: number): number => {
    let alt = rawAlt ?? 600;

    if (!Number.isFinite(alt) || alt < 10 || alt > 100_000) {
      alt = 600;
    }

    if (alt < MIN_ALT) alt = MIN_ALT;
    if (alt > MAX_ALT) alt = MAX_ALT;

    return alt;
  };

  const adjustZoom = async (direction: "in" | "out") => {
    if (!mapRef.current) return;

    const cam = await mapRef.current.getCamera();
    let alt = normalizeAltitude(cam.altitude);

    if (direction === "in") {
      alt = Math.max(MIN_ALT, alt - ZOOM_STEP);
    } else {
      alt = Math.min(MAX_ALT, alt + ZOOM_STEP);
    }

    const newCam: Camera = {
      ...cam,
      altitude: alt,
      pitch: 55,
    };

    mapRef.current.animateCamera(newCam, { duration: 200 });
  };

  const goToMyLocation = async () => {
    if (!mapRef.current) return;

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const cam: Camera = {
        center: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        pitch: 55,
        heading: 0,
        altitude: 600,
      };

      mapRef.current.animateCamera(cam, { duration: 700 });
    } catch (e) {
      console.log("Error refreshing location", e);
    }
  };

  if (!userLocation) {
    return (
      <View style={[styles.map, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  // 🔝 dynamiczne położenie wyspy – zawsze pod safe area
  const floatingTop = insets.top + 12;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={{
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.0045,
        }}
        showsUserLocation={false}
        showsCompass
        showsPointsOfInterest={false}
        showsBuildings
        showsIndoors={false}
        showsTraffic={false}
        zoomEnabled
        scrollEnabled
        rotateEnabled={false}
        pitchEnabled={false}
        mapType="standard"
        customMapStyle={
          Platform.OS === "android"
            ? isDark
              ? darkStyle
              : subtleStyle
            : undefined
        }
      >
        <Marker
          coordinate={{
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.avatarMarker}>
            <Text style={styles.avatarMarkerText}>{userInitials}</Text>
          </View>
        </Marker>
      </MapView>

      {/* 🏝️ Pływająca wyspa – zawsze pod notch, nigdy w safe area */}
      {hasRoute && (
        <View
          style={[
            styles.floatingRouteCard,
            { top: floatingTop },
          ]}
        >
          <View style={styles.routeAccentStrip}>
            <View
              style={[styles.routeAccentSegment, { backgroundColor: COLORS.red }]}
            />
            <View
              style={[
                styles.routeAccentSegment,
                { backgroundColor: COLORS.yellow },
              ]}
            />
            <View
              style={[styles.routeAccentSegment, { backgroundColor: COLORS.blue }]}
            />
          </View>

          <View style={styles.routeCardContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeTitle} numberOfLines={1}>
                {routeTitle}
              </Text>
              <Text style={styles.routeSubtitle}>{progressText}</Text>
            </View>

            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {Math.round(progressRatio * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressRatio * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => adjustZoom("in")}
        >
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => adjustZoom("out")}
        >
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.myLocationButton}>
        <TouchableOpacity style={styles.controlButton} onPress={goToMyLocation}>
          <Text style={styles.controlButtonText}>⌖</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, width: "100%", height: "100%" },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F0E8",
  },

  avatarMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.blue,
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMarkerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  // wyspa BEZ top – top dostaje dynamicznie
  floatingRouteCard: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  routeAccentStrip: {
    flexDirection: "row",
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 8,
  },
  routeAccentSegment: {
    flex: 1,
  },
  routeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  routeSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  progressBadge: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.blue,
  },

  controlsContainer: {
    position: "absolute",
    right: 16,
    bottom: 190,
    flexDirection: "column",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  controlButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  myLocationButton: {
    position: "absolute",
    right: 16,
    bottom: 120,
  },
});

// Android styles
const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#1E1E1E" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];

const subtleStyle = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];

export default Map;
