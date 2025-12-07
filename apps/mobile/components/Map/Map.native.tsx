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
  Circle,
  Camera,
} from "react-native-maps";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { authClient } from "@/lib/auth-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getActivePathProgress, markPointVisited, type PathProgress } from "@/lib/api-client";
import { getAPIBaseURL } from "@/lib/api-url";
import { isWithinGeofence, calculateDistance } from "@/lib/geofence-utils";
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
  const [showCharacterDialog, setShowCharacterDialog] = useState(false);
  const [markingVisited, setMarkingVisited] = useState(false);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [rewardData, setRewardData] = useState<{ label?: string; iconUrl?: string } | null>(null);
  const geofenceCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMarkingVisitedRef = useRef(false);
  const audioSoundRef = useRef<Audio.Sound | null>(null);
  const currentlyPlayingAudioRef = useRef<string | null>(null);
  const [audioPermissionsGranted, setAudioPermissionsGranted] = useState(false);
  const recentlyVisitedStopIdRef = useRef<number | null>(null);

  // Request audio permissions and set audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Request audio permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status === 'granted') {
          setAudioPermissionsGranted(true);
          // Set audio mode to allow playback
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });
          console.log("[Map] Audio permissions granted and mode set");
        } else {
          console.warn("[Map] Audio permissions denied");
        }
      } catch (error) {
        console.error("[Map] Error setting up audio:", error);
      }
    };

    setupAudio();
  }, []);

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

  // Audio playback function
  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      console.log("[Map] playAudio called with URL:", audioUrl);
      
      // Check if we have audio permissions
      if (!audioPermissionsGranted) {
        console.log("[Map] Audio permissions not granted, requesting...");
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn("[Map] Audio permissions denied, cannot play audio");
          return;
        }
        setAudioPermissionsGranted(true);
      }

      // Always set audio mode before playing (important for iOS)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        allowsRecordingIOS: false,
      });
      console.log("[Map] Audio mode set");

      // Stop any currently playing audio
      if (audioSoundRef.current) {
        console.log("[Map] Stopping current audio");
        await audioSoundRef.current.unloadAsync();
        audioSoundRef.current = null;
      }

      // Set the currently playing audio URL
      currentlyPlayingAudioRef.current = audioUrl;

      // Create and play new audio
      const fullAudioUrl = `${getAPIBaseURL()}${audioUrl}`;
      console.log("[Map] Playing audio from URL:", fullAudioUrl);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: fullAudioUrl },
        { 
          shouldPlay: true,
          volume: 1.0,
        }
      );
      
      console.log("[Map] Audio sound created, setting up status listener");
      audioSoundRef.current = sound;

      // Set up playback status listener to track errors and completion
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          if (status.error) {
            console.error("[Map] Audio playback error:", status.error);
            currentlyPlayingAudioRef.current = null;
            sound.unloadAsync();
            audioSoundRef.current = null;
          } else if (status.didJustFinish) {
            console.log("[Map] Audio playback finished");
            currentlyPlayingAudioRef.current = null;
            sound.unloadAsync();
            audioSoundRef.current = null;
          } else {
            // Log playback status for debugging
            if (__DEV__) {
              console.log("[Map] Audio status:", {
                isPlaying: status.isPlaying,
                positionMillis: status.positionMillis,
                durationMillis: status.durationMillis,
              });
            }
          }
        } else {
          console.warn("[Map] Audio status not loaded:", status);
        }
      });

      // Wait a bit and check if audio actually started playing
      setTimeout(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          console.warn("[Map] Audio created but not playing, attempting to play");
          await sound.playAsync();
        }
      }, 100);
    } catch (error) {
      console.error("[Map] Error playing audio:", error);
      currentlyPlayingAudioRef.current = null;
    }
  }, [audioPermissionsGranted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioSoundRef.current) {
        audioSoundRef.current.unloadAsync();
        audioSoundRef.current = null;
      }
      currentlyPlayingAudioRef.current = null;
    };
  }, []);

  const handleMarkVisited = useCallback(async (stop: PathProgress["path"]["stops"][0]) => {
    // Prevent double clicks using both state and ref
    if (!pathProgress || markingVisited || isMarkingVisitedRef.current) {
      console.log("[Map] handleMarkVisited: Already processing, ignoring click");
      return;
    }

    // Set both state and ref immediately to prevent double clicks
    isMarkingVisitedRef.current = true;
    setMarkingVisited(true);
    
    // Keep dialog visible but button will be disabled via markingVisited state

    try {
      const result = await markPointVisited(stop.point_id, pathProgress.progress.id);
      if (result.success) {
        // Mark this stop as recently visited to prevent geofence re-triggering
        recentlyVisitedStopIdRef.current = stop.point_id;
        // Clear the recently visited flag after 5 seconds
        setTimeout(() => {
          recentlyVisitedStopIdRef.current = null;
        }, 5000);
        
        // Hide dialog on success - do this immediately
        setShowCharacterDialog(false);
        setSelectedStop(null);
        
        // Show reward notification if there's a reward
        if (stop.reward_label || stop.reward_icon_url) {
          setRewardData({
            label: stop.reward_label || undefined,
            iconUrl: stop.reward_icon_url || undefined,
          });
          setShowRewardNotification(true);
          // Auto-hide after 3 seconds
          setTimeout(() => {
            setShowRewardNotification(false);
            setRewardData(null);
          }, 3000);
        }

        // If path completed, clear progress and show completion message
        if (result.isCompleted) {
          // Path is completed - clear progress to hide route UI
          setPathProgress(null);
          // Show completion notification
          // setRewardData({
          //   label: "Trasa ukończona! 🎉",
          // });
          // setShowRewardNotification(true);
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShowRewardNotification(false);
            setRewardData(null);
          }, 5000);
        } else {
          // Path not completed yet - reload progress to get updated state
          const updatedProgress = await getActivePathProgress();
          if (updatedProgress) {
            setPathProgress(updatedProgress);
          } else {
            // If no progress returned, it might have been completed or paused
            // Clear the progress state
            setPathProgress(null);
          }
        }
      } else {
        // If failed, keep dialog visible and show error
        console.error("[Map] Failed to mark point as visited:", result.error);
        // Dialog is already visible, just reset the loading state
      }
    } catch (error) {
      console.error("[Map] Error marking point as visited:", error);
      // Dialog is already visible, just reset the loading state
    } finally {
      setMarkingVisited(false);
      isMarkingVisitedRef.current = false;
    }
  }, [pathProgress, markingVisited]);

  // Geofence detection - check if user enters any unvisited stop
  useEffect(() => {
    if (!userLocation || !pathProgress || showCharacterDialog) return;

    const checkGeofences = () => {
      if (!pathProgress) return;

      const unvisitedStops = pathProgress.path.stops.filter((stop) => !stop.visited);
      
      if (__DEV__ && unvisitedStops.length > 0) {
        console.log(`[Geofence] Checking ${unvisitedStops.length} unvisited stops`);
        unvisitedStops.forEach((stop, idx) => {
          console.log(`[Geofence] Stop ${idx + 1}: ${stop.name}, audio_url: ${stop.audio_url || 'MISSING'}`);
        });
      }
      
      for (const stop of unvisitedStops) {
        // Skip if this stop was recently visited (prevents re-triggering)
        if (recentlyVisitedStopIdRef.current === stop.point_id) {
          continue;
        }
        
        const radius = stop.radius_meters || 50; // Default 50m if not set
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          stop.map_marker.coordinates.latitude,
          stop.map_marker.coordinates.longitude
        );
        
        if (__DEV__) {
          console.log(`[Geofence] Stop: ${stop.name}, Distance: ${distance.toFixed(2)}m, Radius: ${radius}m, Within: ${distance <= radius}`);
        }
        
        if (distance <= radius) {
          // User entered geofence - show character dialog
          console.log(`[Geofence] ✅ TRIGGERED for stop: ${stop.name}`);
          console.log(`[Geofence] Stop data:`, JSON.stringify({
            name: stop.name,
            point_id: stop.point_id,
            audio_url: stop.audio_url,
            has_character: !!stop.character,
          }, null, 2));
          console.log(`[Geofence] Setting selectedStop and showCharacterDialog to true`);
          setSelectedStop(stop);
          setShowCharacterDialog(true);
          console.log(`[Geofence] State updated - dialog should appear now`);
          
          // Play audio if available
          console.log(`[Geofence] Checking audio - audio_url:`, stop.audio_url);
          console.log(`[Geofence] Currently playing:`, currentlyPlayingAudioRef.current);
          if (stop.audio_url) {
            console.log(`[Geofence] ✅ Stop has audio_url: ${stop.audio_url}`);
            if (stop.audio_url !== currentlyPlayingAudioRef.current) {
              console.log(`[Geofence] 🎵 Triggering audio playback for: ${stop.audio_url}`);
              playAudio(stop.audio_url);
            } else {
              console.log(`[Geofence] ⏸️ Audio already playing, skipping`);
            }
          } else {
            console.log(`[Geofence] ❌ Stop has no audio_url property`);
          }
          
          break; // Only handle one stop at a time
        }
      }
    };

    // Check immediately when location changes
    checkGeofences();

    // Also check every 2 seconds for continuous monitoring
    geofenceCheckIntervalRef.current = setInterval(checkGeofences, 2000);

    return () => {
      if (geofenceCheckIntervalRef.current) {
        clearInterval(geofenceCheckIntervalRef.current);
      }
    };
  }, [userLocation, pathProgress, showCharacterDialog]);

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

        {/* Radius circles for stops */}
        {pathProgress && pathProgress.path.stops.map((stop) => {
          const radius = stop.radius_meters || 50;
          const isVisited = stop.visited;
          const isNext = !isVisited && pathProgress.path.stops.findIndex((s) => !s.visited) === pathProgress.path.stops.indexOf(stop);
          
          return (
            <Circle
              key={`radius-${stop.point_id}`}
              center={{
                latitude: stop.map_marker.coordinates.latitude,
                longitude: stop.map_marker.coordinates.longitude,
              }}
              radius={radius}
              fillColor={isVisited ? "rgba(156, 163, 175, 0.2)" : isNext ? "rgba(237, 28, 36, 0.15)" : "rgba(255, 222, 0, 0.15)"}
              strokeColor={isVisited ? "#9CA3AF" : isNext ? COLORS.red : COLORS.yellow}
              strokeWidth={2}
            />
          );
        })}

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

        {/* Debug button - only in development */}
        {__DEV__ && pathProgress && pathProgress.path.stops.length > 0 && (
          <TouchableOpacity
            style={[styles.controlButton, styles.debugButton]}
            onPress={() => {
              // Find first unvisited stop, or first stop if all visited
              const firstStop = pathProgress.path.stops.find((stop) => !stop.visited) 
                || pathProgress.path.stops[0];
              
              if (firstStop) {
                const radius = firstStop.radius_meters || 50;
                // Set location inside the radius (50% of radius to ensure we're well inside)
                // Use a more accurate conversion: 1 degree latitude ≈ 111,000 meters
                // For longitude, we need to account for latitude (cos(lat) factor)
                const latOffset = (radius * 0.5) / 111000; // 50% of radius in degrees
                const lngOffset = (radius * 0.5) / (111000 * Math.cos(firstStop.map_marker.coordinates.latitude * Math.PI / 180));
                
                const newLocation = {
                  lat: firstStop.map_marker.coordinates.latitude + latOffset,
                  lng: firstStop.map_marker.coordinates.longitude + lngOffset,
                };
                
                console.log("[DEBUG] Moving to stop:", firstStop.name);
                console.log("[DEBUG] Stop location:", firstStop.map_marker.coordinates);
                console.log("[DEBUG] New user location:", newLocation);
                console.log("[DEBUG] Radius:", radius, "meters");
                console.log("[DEBUG] Distance from stop:", 
                  isWithinGeofence(
                    newLocation.lat,
                    newLocation.lng,
                    firstStop.map_marker.coordinates.latitude,
                    firstStop.map_marker.coordinates.longitude,
                    radius
                  ) ? "INSIDE" : "OUTSIDE"
                );
                
                setUserLocation(newLocation);
                
                // Also update map camera
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: newLocation.lat,
                    longitude: newLocation.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 500);
                }

                // Force immediate geofence check
                setTimeout(() => {
                  const unvisitedStops = pathProgress.path.stops.filter((stop) => !stop.visited);
                  for (const stop of unvisitedStops) {
                    const stopRadius = stop.radius_meters || 50;
                    if (
                      isWithinGeofence(
                        newLocation.lat,
                        newLocation.lng,
                        stop.map_marker.coordinates.latitude,
                        stop.map_marker.coordinates.longitude,
                        stopRadius
                      )
                    ) {
                      console.log("[DEBUG] Geofence triggered for:", stop.name);
                      console.log("[DEBUG] Stop audio_url:", stop.audio_url);
                      setSelectedStop(stop);
                      setShowCharacterDialog(true);
                      // Also trigger audio if available
                      if (stop.audio_url && stop.audio_url !== currentlyPlayingAudioRef.current) {
                        console.log("[DEBUG] Triggering audio playback");
                        playAudio(stop.audio_url);
                      }
                      break;
                    }
                  }
                }, 600); // Wait for animation to complete
              }
            }}
          >
            <Text style={styles.controlIcon}>🐛</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Character Dialog - Bottom Right */}
      {(() => {
        if (__DEV__) {
          console.log(`[Render] showCharacterDialog: ${showCharacterDialog}, selectedStop: ${selectedStop ? selectedStop.name : 'null'}`);
        }
        return null;
      })()}
      {showCharacterDialog && selectedStop && (
        <View style={styles.characterContainer}>
          {/* Speech Bubble - Left side */}
          <View style={styles.speechBubble}>
            {selectedStop.character ? (
              <>
                <Text style={styles.characterName}>{selectedStop.character.name}</Text>
                <Text style={styles.characterDescription}>{selectedStop.character.description}</Text>
              </>
            ) : (
              <Text style={styles.characterName}>{selectedStop.name}</Text>
            )}
            <Text style={styles.stopDescription}>{selectedStop.place_description}</Text>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleMarkVisited(selectedStop)}
              disabled={markingVisited}>
              <Text style={styles.completeButtonText}>
                {markingVisited ? "Zapisywanie..." : "Oznacz jako odwiedzone"}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Character Avatar - Right side */}
          {selectedStop.character && selectedStop.character.avatarUrl ? (
            <View style={styles.characterAvatarContainer}>
              <Image
                source={{ uri: `${getAPIBaseURL()}${selectedStop.character.avatarUrl}` }}
                style={styles.characterAvatar}
                resizeMode="cover"
                onError={(e) => {
                  console.error("[Map] Error loading character avatar:", e.nativeEvent.error);
                }}
              />
            </View>
          ) : (
            <View style={styles.characterAvatarContainer}>
              <View style={[styles.characterAvatar, { backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700' }}>📍</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Reward Notification Overlay */}
      {showRewardNotification && rewardData && (
        <View style={styles.rewardNotification}>
          <View style={styles.rewardNotificationContent}>
            {rewardData.iconUrl ? (
              <Image
                source={{ uri: `${getAPIBaseURL()}${rewardData.iconUrl}` }}
                style={styles.rewardNotificationIcon}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.rewardNotificationIconPlaceholder}>
                <Text style={{ fontSize: 24 }}>🎁</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardNotificationText}>
                Otrzymałeś nagrodę{rewardData.label ? `: ${rewardData.label}` : "!"}
              </Text>
            </View>
          </View>
        </View>
      )}
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
  debugButton: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
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
  characterContainer: {
    position: "absolute",
    bottom: 120,
    right: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    maxWidth: "85%",
  },
  speechBubble: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 8,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.default,
    marginBottom: 4,
  },
  characterDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.blue,
    marginBottom: 8,
  },
  stopDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: COLORS.red,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  characterAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    overflow: "hidden",
  },
  characterAvatar: {
    width: "100%",
    height: "100%",
  },
  rewardNotification: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: COLORS.yellow,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rewardNotificationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rewardNotificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  rewardNotificationIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  rewardNotificationText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.default,
    marginLeft: 12,
    flex: 1,
  },
});

export default Map;
