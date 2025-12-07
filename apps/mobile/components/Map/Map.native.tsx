import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
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
import { getActivePathProgress, markPointVisited, type PathProgress } from "@/lib/api-client";
import { getAPIBaseURL } from "@/lib/api-url";
import { isWithinGeofence } from "@/lib/geofence-utils";
import { Modal } from "react-native";

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
  const [pathProgress, setPathProgress] = useState<PathProgress | null>(null);
  const [selectedStop, setSelectedStop] = useState<PathProgress["path"]["stops"][0] | null>(null);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [markingVisited, setMarkingVisited] = useState(false);
  const geofenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active path progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await getActivePathProgress();
        setPathProgress(progress);
      } catch (error) {
        console.error("[Map] Error loading path progress:", error);
        setPathProgress(null);
      }
    };

    loadProgress();
  }, []);

  const hasRoute = !!pathProgress;
  const routeTitle = pathProgress?.path.title ?? "";
  const totalStops = pathProgress?.path.stops.length ?? 0;
  const completedStops = pathProgress?.progress.visitedStopsCount ?? 0;
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

  // Convert path stops to route pins - memoized to prevent infinite loops
  const routePins: RoutePin[] = useMemo(() => {
    if (!pathProgress) return [];
    
    return pathProgress.path.stops.map((stop, index) => {
      const isVisited = stop.visited;
      const isNext = !isVisited && index === pathProgress.path.stops.findIndex((s) => !s.visited);
      
      // Determine variant based on status
      let variant: MarkerVariant = "default";
      if (isNext) variant = "primary";
      else if (isVisited) variant = "default";
      else variant = "secondary";

      return {
        id: `stop-${stop.stop_id}`,
        lat: stop.map_marker.coordinates.latitude,
        lng: stop.map_marker.coordinates.longitude,
        variant,
        label: stop.stop_id.toString(),
        imageSource: pathProgress.path.marker_icon_url
          ? { uri: `${getAPIBaseURL()}${pathProgress.path.marker_icon_url}` }
          : undefined,
      };
    });
  }, [pathProgress]);

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

  // OSRM – policz trasę od usera do następnego nieodwiedzonego przystanku
  useEffect(() => {
    const fetchOsrmRoute = async () => {
      if (!userLocation || !pathProgress || routePins.length === 0) {
        setRouteCoordinates([]);
        setRouteSteps([]);
        return;
      }

      // Find next unvisited stop
      const nextUnvisitedStop = pathProgress.path.stops.find((stop) => !stop.visited);
      if (!nextUnvisitedStop) {
        // All stops visited, route to last stop
        const lastStop = pathProgress.path.stops[pathProgress.path.stops.length - 1];
        if (lastStop) {
          const coordsStr = `${userLocation.lng},${userLocation.lat};${lastStop.map_marker.coordinates.longitude},${lastStop.map_marker.coordinates.latitude}`;
          await fetchRoute(coordsStr);
        }
        return;
      }

      // Route from user to next unvisited stop
      const coordsStr = `${userLocation.lng},${userLocation.lat};${nextUnvisitedStop.map_marker.coordinates.longitude},${nextUnvisitedStop.map_marker.coordinates.latitude}`;
      await fetchRoute(coordsStr);
    };

    const fetchRoute = async (coordsStr: string) => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/foot/${coordsStr}` +
          "?overview=full&geometries=geojson&steps=true";

        const res = await fetch(url);

        if (!res.ok) {
          console.log("OSRM error status:", res.status);
          setRouteCoordinates([]);
          setRouteSteps([]);
          return;
        }

        const data = await res.json();
        const coords: [number, number][] =
          data.routes?.[0]?.geometry?.coordinates ?? [];
        const steps: OsrmStep[] =
          data.routes?.[0]?.legs?.[0]?.steps ?? [];

        if (coords.length) {
          const route = coords.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoordinates(route);
        } else {
          setRouteCoordinates([]);
        }

        setRouteSteps(steps);
      } catch (e) {
        console.log("Error fetching OSRM route:", e);
        setRouteCoordinates([]);
        setRouteSteps([]);
      }
    };

    fetchOsrmRoute();
  }, [userLocation, pathProgress]); // Removed routePins - it's derived from pathProgress

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

  const handleMarkVisited = useCallback(async (stop: PathProgress["path"]["stops"][0]) => {
    if (!pathProgress || markingVisited) return;

    setMarkingVisited(true);
    try {
      const result = await markPointVisited(stop.point_id, pathProgress.progress.id);
      if (result.success) {
        // Reload progress to get updated state
        const updatedProgress = await getActivePathProgress();
        if (updatedProgress) {
          setPathProgress(updatedProgress);
        }

        // If path completed, show completion message
        if (result.isCompleted) {
          setTimeout(() => {
            setShowStopDialog(false);
            // Could show completion modal here
          }, 2000);
        }
      }
    } catch (error) {
      console.error("[Map] Error marking point as visited:", error);
    } finally {
      setMarkingVisited(false);
    }
  }, [pathProgress, markingVisited]);

  // Geofence detection - check if user enters any unvisited stop
  useEffect(() => {
    if (!userLocation || !pathProgress || showStopDialog) return;

    const checkGeofences = () => {
      if (!pathProgress) return;

      const unvisitedStops = pathProgress.path.stops.filter((stop) => !stop.visited);
      
      for (const stop of unvisitedStops) {
        const radius = stop.radius_meters || 50; // Default 50m if not set
        if (
          isWithinGeofence(
            userLocation.lat,
            userLocation.lng,
            stop.map_marker.coordinates.latitude,
            stop.map_marker.coordinates.longitude,
            radius
          )
        ) {
          // User entered geofence - show dialog and mark as visited
          setSelectedStop(stop);
          setShowStopDialog(true);
          handleMarkVisited(stop);
          break; // Only handle one stop at a time
        }
      }
    };

    // Check every 2 seconds
    geofenceCheckIntervalRef.current = setInterval(checkGeofences, 2000);

    return () => {
      if (geofenceCheckIntervalRef.current) {
        clearInterval(geofenceCheckIntervalRef.current);
      }
    };
  }, [userLocation, pathProgress, showStopDialog, handleMarkVisited]);

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

  const openInGoogleMaps = () => {
    if (!routePins.length) return;
    const dest = routePins[routePins.length - 1];
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=walking`;
    Linking.openURL(url).catch((err) =>
      console.log("Error opening Google Maps", err),
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

          {/* Google Maps CTA */}
          <View style={styles.appleRow}>
            <TouchableOpacity
              style={styles.appleButton}
              onPress={openInGoogleMaps}
            >
              <Text style={styles.appleButtonText}>Otwórz w Google Maps</Text>
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

      {/* Stop Dialog Modal */}
      <Modal
        visible={showStopDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStopDialog(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStop && (
              <>
                {selectedStop.reward_icon_url && (
                  <Image
                    source={{ uri: `${getAPIBaseURL()}${selectedStop.reward_icon_url}` }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.modalTitle}>{selectedStop.name}</Text>
                <Text style={styles.modalDescription}>
                  {selectedStop.place_description}
                </Text>
                {selectedStop.reward_label && (
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>
                      🎁 {selectedStop.reward_label}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowStopDialog(false)}>
                  <Text style={styles.modalCloseText}>Zamknij</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.default,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 16,
  },
  rewardBadge: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.default,
  },
  modalCloseButton: {
    backgroundColor: COLORS.red,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Map;
