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
  Linking,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Marker,
  Polyline,
  Camera,
} from "react-native-maps";
import * as Location from "expo-location";
import { authClient } from "@/lib/auth-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  default: "#111827",
};

// zoom po stronie kamery
const MIN_ZOOM = 13;
const MAX_ZOOM = 19;
const ZOOM_STEP = 0.6;

// fallback na altitude (jak zoom nie działa)
const MIN_ALT = 80;
const MAX_ALT = 8000;
const ALT_FACTOR = 0.7; // < 1 → przybliżenie, > 1 → oddalenie

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
  imageSource?: any;
};

type OsrmStep = {
  distance: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
  };
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
  const [routeSteps, setRouteSteps] = useState<OsrmStep[]>([]);
  const mapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );

  // Mock – realna trasa później z backendu
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

  // User info
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

  // Piny trasy
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

  const formatDistance = (meters: number) => {
    if (!Number.isFinite(meters)) return "";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatManeuverText = (step: OsrmStep | undefined): string => {
    if (!step) return "Brak danych o następnym manewrze";
    const { type, modifier } = step.maneuver || {};
    const street = step.name ? ` w ${step.name}` : "";

    if (type === "arrive") return "Dotrzesz do celu";
    if (type === "depart") return "Rozpocznij trasę";

    if (type === "roundabout") {
      return `Wjedź na rondo${street}`;
    }

    if (type === "turn" || type === "continue") {
      switch (modifier) {
        case "left":
          return `Skręć w lewo${street}`;
        case "right":
          return `Skręć w prawo${street}`;
        case "slight left":
          return `Lekko w lewo${street}`;
        case "slight right":
          return `Lekko w prawo${street}`;
        case "straight":
        default:
          return `Jedź prosto${street}`;
      }
    }

    return `Kontynuuj${street}`;
  };

  const nextStep = routeSteps[0];
  const nextStepDistance = nextStep ? formatDistance(nextStep.distance) : null;
  const nextStepText = formatManeuverText(nextStep);

  // OSRM – policz trasę między pinami + wyciągnij kroki
  useEffect(() => {
    const fetchOsrmRoute = async () => {
      if (routePins.length < 2) return;

      try {
        const coordsStr = routePins
          .map((p) => `${p.lng},${p.lat}`)
          .join(";");

        const url =
          `https://router.project-osrm.org/route/v1/foot/${coordsStr}` +
          "?overview=full&geometries=geojson&steps=true";

        const res = await fetch(url);

        if (!res.ok) {
          console.log("OSRM error status:", res.status);
          // fallback: prosta linia
          setRouteCoordinates(
            routePins.map((p) => ({
              latitude: p.lat,
              longitude: p.lng,
            })),
          );
          setRouteSteps([]);
          return;
        }

        const data = await res.json();
        const coords: [number, number][] =
          data.routes?.[0]?.geometry?.coordinates ?? [];
        const steps: OsrmStep[] =
          data.routes?.[0]?.legs?.[0]?.steps ?? [];

        if (!coords.length) {
          setRouteCoordinates(
            routePins.map((p) => ({
              latitude: p.lat,
              longitude: p.lng,
            })),
          );
        } else {
          const route = coords.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoordinates(route);
        }

        setRouteSteps(steps);
      } catch (e) {
        console.log("Error fetching OSRM route:", e);
        setRouteCoordinates(
          routePins.map((p) => ({
            latitude: p.lat,
            longitude: p.lng,
          })),
        );
        setRouteSteps([]);
      }
    };

    fetchOsrmRoute();
  }, []); // routePins stałe

  // Lokalizacja usera
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

        const base = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };

        setUserLocation(base);

        // startowa kamera
        const cam: Camera = {
          center: {
            latitude: base.lat,
            longitude: base.lng,
          },
          pitch: 55,
          heading: 0,
          zoom: 16,
        };

        mapRef.current?.animateCamera(cam, { duration: 600 });
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
            const updated = {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            };
            setUserLocation(updated);
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

  const clampZoom = (z: number) => {
    if (!Number.isFinite(z)) return 16;
    if (z < MIN_ZOOM) return MIN_ZOOM;
    if (z > MAX_ZOOM) return MAX_ZOOM;
    return z;
  };

  const clampAlt = (a: number) => {
    if (!Number.isFinite(a)) return 600;
    if (a < MIN_ALT) return MIN_ALT;
    if (a > MAX_ALT) return MAX_ALT;
    return a;
  };

  // 🔍 Zoom po kamerze – tak, żeby + ZAWSZE przybliżało
  const adjustZoom = async (direction: "in" | "out") => {
    if (!mapRef.current) return;

    const cam = await mapRef.current.getCamera();

    const hasZoom = cam.zoom !== undefined && cam.zoom !== null;

    if (hasZoom) {
      let zoom = clampZoom(cam.zoom as number);

      if (direction === "in") {
        zoom += ZOOM_STEP;
      } else {
        zoom -= ZOOM_STEP;
      }

      zoom = clampZoom(zoom);

      const newCam: Camera = {
        ...cam,
        zoom,
      };

      mapRef.current.animateCamera(newCam, { duration: 200 });
    } else {
      let alt = clampAlt(cam.altitude ?? 600);

      if (direction === "in") {
        alt *= ALT_FACTOR; // < 1 → bliżej
      } else {
        alt /= ALT_FACTOR; // > 1 → dalej
      }

      alt = clampAlt(alt);

      const newCam: Camera = {
        ...cam,
        altitude: alt,
      };

      mapRef.current.animateCamera(newCam, { duration: 200 });
    }
  };

  const goToMyLocation = async () => {
    if (!userLocation || !mapRef.current) return;

    try {
      const cam = await mapRef.current.getCamera();
      const hasZoom = cam.zoom !== undefined && cam.zoom !== null;

      const newCam: Camera = hasZoom
        ? {
            ...cam,
            center: {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            },
            zoom: clampZoom((cam.zoom as number) || 16),
          }
        : {
            ...cam,
            center: {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            },
            altitude: clampAlt(cam.altitude ?? 600),
          };

      mapRef.current.animateCamera(newCam, { duration: 600 });
    } catch (e) {
      console.log("Error goToMyLocation", e);
    }
  };

  const openInAppleMaps = () => {
    if (!routePins.length) return;
    const dest = routePins[routePins.length - 1];
    const url = `http://maps.apple.com/?daddr=${dest.lat},${dest.lng}&dirflg=w`;
    Linking.openURL(url).catch((err) =>
      console.log("Error opening Apple Maps", err),
    );
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
        customMapStyle={
          Platform.OS === "android"
            ? isDark
              ? darkStyle
              : subtleStyle
            : undefined
        }
      >
        {/* OSRM Polyline pomiędzy pinami */}
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

        {/* piny trasy – kółka */}
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

      {/* pływająca wyspa z progresem trasy + następnym manewrem */}
      {hasRoute && (
        <View style={[styles.floatingRouteCard, { top: floatingTop }]}>
          <View style={styles.routeCardHeaderRow}>
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

          {/* Next turn info */}
          <View style={styles.nextStepRow}>
            <View style={styles.nextStepIcon}>
              <Text style={styles.nextStepIconText}>↱</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nextStepLabel}>
                Następny manewr
                {nextStepDistance ? ` • za ${nextStepDistance}` : ""}
              </Text>
              <Text style={styles.nextStepText} numberOfLines={2}>
                {nextStepText}
              </Text>
            </View>
          </View>

          {/* Apple Maps CTA */}
          <View style={styles.appleRow}>
            <TouchableOpacity
              style={styles.appleButton}
              onPress={openInAppleMaps}
            >
              <Text style={styles.appleButtonText}>Otwórz w Apple Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Kontrolki mapy */}
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

  // Kółkowe piny
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
  routeCardHeaderRow: {
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

  nextStepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  nextStepIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  nextStepIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.blue,
  },
  nextStepLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  nextStepText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    marginTop: 2,
  },

  appleRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  appleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  appleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.blue,
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
