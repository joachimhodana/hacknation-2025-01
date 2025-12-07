import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  Appearance,
  Image,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Camera,
  Marker,
  Polyline,
} from "react-native-maps";
import * as Location from "expo-location";
import { authClient } from "@/lib/auth-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_ALT = 120;
const MAX_ALT = 8000;
const ZOOM_ALT_STEP = 400;

const MIN_ZOOM = 13;
const MAX_ZOOM = 19;
const ZOOM_STEP = 0.6;

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  default: "#111827",
};

type ActiveRoute = {
  title: string;
  totalStops: number;
  completedStops: number;
} | null;

type MarkerVariant = "default" | "primary" | "secondary" | "tertiary";

type RoutePin = {
  id: string;
  lat: number;
  lng: number;
  variant: MarkerVariant;
  label?: string;
  imageSource?: any; // require(...) jak będziesz miał asset
};

export const Map: React.FC = () => {
  const colorScheme = Appearance.getColorScheme();
  const isDark = colorScheme === "dark";
  const { data: session } = authClient.useSession();
  const insets = useSafeAreaInsets();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const mapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );

  // 🔹 Mock – podepniesz tu realne dane trasy
  const activeRoute: ActiveRoute = {
    title: "Szlak Mariana Rejewskiego",
    totalStops: 8,
    completedStops: 3,
  };

  const hasRoute = !!activeRoute;
  const routeTitle = activeRoute?.title ?? "";
  const totalStops = activeRoute?.totalStops ?? 0;
  const completedStops = Math.min(activeRoute?.completedStops ?? 0, totalStops);
  const progressRatio = totalStops > 0 ? completedStops / totalStops : 0;
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

  // 🔵🔴🟡 Trzy typy markerów + domyślny – wszystkie kółka
  const routePins: RoutePin[] = [
    {
      id: "pin-default",
      lat: 53.1235,
      lng: 18.0084,
      variant: "default",
      label: "D",
    },
    {
      id: "pin-primary",
      lat: 53.1227,
      lng: 18.0048,
      variant: "primary",
      label: "Q",
    },
    {
      id: "pin-secondary",
      lat: 53.1242,
      lng: 18.0121,
      variant: "secondary",
      label: "i",
    },
    {
      id: "pin-tertiary",
      lat: 53.123,
      lng: 18.011,
      variant: "tertiary",
      label: "★",
      // imageSource: require("@/assets/pins/quest.png"),
    },
  ];

  const getPinColors = (variant: MarkerVariant) => {
    switch (variant) {
      case "primary":
        return { bg: COLORS.red, ring: "#FFFFFF" };
      case "secondary":
        return { bg: COLORS.yellow, ring: "#FFFFFF" };
      case "tertiary":
        return { bg: COLORS.blue, ring: "#FFFFFF" };
      case "default":
      default:
        return { bg: "#F3F4F6", ring: "#D1D5DB" };
    }
  };

  // 🔗 OSRM – pobierz realną trasę między pinami i zapisz jako Polyline
  useEffect(() => {
    const fetchOsrmRoute = async () => {
      if (routePins.length < 2) return;

      try {
        const coordsStr = routePins
          .map((p) => `${p.lng},${p.lat}`)
          .join(";");

        const url =
          `https://router.project-osrm.org/route/v1/foot/${coordsStr}` +
          "?overview=full&geometries=geojson";

        const res = await fetch(url);

        if (!res.ok) {
          console.log("OSRM error status:", res.status);
          // fallback: prosta linia między pinami
          setRouteCoordinates(
            routePins.map((p) => ({
              latitude: p.lat,
              longitude: p.lng,
            })),
          );
          return;
        }

        const data = await res.json();

        const coords: [number, number][] =
          data.routes?.[0]?.geometry?.coordinates ?? [];

        if (!coords.length) {
          // fallback jak OSRM nic nie zwróci
          setRouteCoordinates(
            routePins.map((p) => ({
              latitude: p.lat,
              longitude: p.lng,
            })),
          );
          return;
        }

        const route = coords.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        }));

        setRouteCoordinates(route);
      } catch (e) {
        console.log("Error fetching OSRM route:", e);
        // fallback: prosta linia między pinami
        setRouteCoordinates(
          routePins.map((p) => ({
            latitude: p.lat,
            longitude: p.lng,
          })),
        );
      }
    };

    // routePins są na razie stałe → wystarczy raz na mount
    fetchOsrmRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Startowa kamera
  useEffect(() => {
    if (userLocation && mapRef.current) {
      const cam: Camera =
        Platform.OS === "android"
          ? {
              center: {
                latitude: userLocation.lat,
                longitude: userLocation.lng,
              },
              pitch: 55,
              heading: 0,
              zoom: 16,
            }
          : {
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

  const clampZoom = (z?: number) => {
    let zoom = z ?? 16;
    if (!Number.isFinite(zoom)) zoom = 16;
    if (zoom < MIN_ZOOM) zoom = MIN_ZOOM;
    if (zoom > MAX_ZOOM) zoom = MAX_ZOOM;
    return zoom;
  };

  // ✅ poprawione przybliżanie/oddalanie
  const adjustZoom = async (direction: "in" | "out") => {
    if (!mapRef.current) return;

    const cam = await mapRef.current.getCamera();
    let newCam: Camera;

    if (cam.zoom !== undefined && cam.zoom !== null) {
      // prefer zoom
      let zoom = clampZoom(cam.zoom as number);
      zoom += direction === "in" ? ZOOM_STEP : -ZOOM_STEP;
      zoom = clampZoom(zoom);

      newCam = {
        ...cam,
        zoom,
        pitch: 55,
      };
    } else {
      // fallback: altitude
      let alt = normalizeAltitude(cam.altitude);
      alt += direction === "in" ? -ZOOM_ALT_STEP : ZOOM_ALT_STEP;
      alt = normalizeAltitude(alt);

      newCam = {
        ...cam,
        altitude: alt,
        pitch: 55,
      };
    }

    mapRef.current.animateCamera(newCam, { duration: 200 });
  };

  const goToMyLocation = async () => {
    if (!mapRef.current) return;

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const cam: Camera =
        Platform.OS === "android"
          ? {
              center: {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              },
              pitch: 55,
              heading: 0,
              zoom: 16,
            }
          : {
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
        minZoomLevel={MIN_ZOOM}
        maxZoomLevel={MAX_ZOOM}
        customMapStyle={
          Platform.OS === "android"
            ? isDark
              ? darkStyle
              : subtleStyle
            : undefined
        }
      >
        {/* 🔵 OSRM Polyline pomiędzy pinami */}
        {routeCoordinates.length >= 2 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={COLORS.blue}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* marker użytkownika */}
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

        {/* piny trasy – kółka, jeden styl, 3 typy + domyślny */}
        {routePins.map((pin) => {
          const { bg, ring } = getPinColors(pin.variant);

          return (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.lat, longitude: pin.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={[
                  styles.pinCircleOuter,
                  {
                    borderColor: ring,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pinCircleInner,
                    {
                      backgroundColor: bg,
                    },
                  ]}
                >
                  {pin.imageSource ? (
                    <Image
                      source={pin.imageSource}
                      style={styles.pinImage}
                    />
                  ) : (
                    <Text style={styles.pinLabel}>
                      {pin.label ?? ""}
                    </Text>
                  )}
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* pływająca wyspa z progresem trasy */}
      {hasRoute && (
        <View style={[styles.floatingRouteCard, { top: floatingTop }]}>
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

      {/* Kontrolki mapy – równe odstępy, normalne ikonki */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => adjustZoom("in")}
        >
          <Text style={styles.controlIcon}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => adjustZoom("out")}
        >
          <Text style={styles.controlIcon}>－</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={goToMyLocation}
        >
          <Text style={styles.controlIcon}>⌖</Text>
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

  // Kółkowe piny – jeden styl, różne warianty kolorystyczne
  pinCircleOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  pinCircleInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pinImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
    resizeMode: "cover",
  },

  // Wyspa
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

  // Kontrolki mapy
  controlsContainer: {
    position: "absolute",
    right: 16,
    bottom: 120,
    flexDirection: "column",
    alignItems: "center",
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    marginBottom: 10,
  },
  controlIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.red,
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
