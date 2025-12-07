import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { authClient } from "@/lib/auth-client";
import { getActivePathProgress, markPointVisited, type PathProgress } from "@/lib/api-client";
import { getAPIBaseURL } from "@/lib/api-url";
import { isWithinGeofence, calculateDistance } from "@/lib/geofence-utils";

export type MapProps = {
  lat?: number;
  lng?: number;
  zoom?: number;
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

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  default: "#111827",
};

const MIN_ZOOM = 13;
const MAX_ZOOM = 19;
const ZOOM_STEP = 0.6;

export const Map: React.FC<MapProps> = ({ lat, lng, zoom }) => {
  const { isMobile } = useDeviceDetection();
  const { data: session } = authClient.useSession();

  const defaultZoom = useMemo(
    () => zoom ?? (isMobile ? 15 : 13),
    [zoom, isMobile],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const routePinsRef = useRef<any[]>([]);
  const routeLineRef = useRef<any>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeSteps, setRouteSteps] = useState<OsrmStep[]>([]);
  const [pathProgress, setPathProgress] = useState<PathProgress | null>(null);
  const [selectedStop, setSelectedStop] = useState<PathProgress["path"]["stops"][0] | null>(null);
  const [showCharacterDialog, setShowCharacterDialog] = useState(false);
  const [markingVisited, setMarkingVisited] = useState(false);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [rewardData, setRewardData] = useState<{ label?: string; iconUrl?: string } | null>(null);
  const geofenceCheckIntervalRef = useRef<number | null>(null);
  const isMarkingVisitedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentlyPlayingAudioRef = useRef<string | null>(null);

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

  const routePins: RoutePin[] = useMemo(() => {
    if (!pathProgress) return [];

    return pathProgress.path.stops.map((stop, index) => {
      const isVisited = stop.visited;
      const isNext = !isVisited && index === pathProgress.path.stops.findIndex((s) => !s.visited);

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

  const clampZoom = (z: number) => {
    if (!Number.isFinite(z)) return 16;
    if (z < MIN_ZOOM) return MIN_ZOOM;
    if (z > MAX_ZOOM) return MAX_ZOOM;
    return z;
  };

  const adjustZoom = (direction: "in" | "out") => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    let newZoom = currentZoom;

    if (direction === "in") {
      newZoom += ZOOM_STEP;
    } else {
      newZoom -= ZOOM_STEP;
    }

    newZoom = clampZoom(newZoom);
    mapInstanceRef.current.easeTo({
      zoom: newZoom,
      duration: 200,
    });
  };

  const goToMyLocation = () => {
    if (!userLocation || !mapInstanceRef.current) return;
    mapInstanceRef.current.easeTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: defaultZoom,
      pitch: 45,
      duration: 600,
    });
  };

  const openInGoogleMaps = () => {
    if (!routePins.length) return;
    const dest = routePins[routePins.length - 1];
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=walking`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const fetchOsrmRoute = async () => {
      if (!userLocation || !pathProgress || routePins.length === 0) {
        setRouteCoordinates([]);
        setRouteSteps([]);
        return;
      }

      const nextUnvisitedStop = pathProgress.path.stops.find((stop) => !stop.visited);
      if (!nextUnvisitedStop) {
        const lastStop = pathProgress.path.stops[pathProgress.path.stops.length - 1];
        if (lastStop) {
          const coordsStr = `${userLocation.lng},${userLocation.lat};${lastStop.map_marker.coordinates.longitude},${lastStop.map_marker.coordinates.latitude}`;
          await fetchRoute(coordsStr);
        }
        return;
      }

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
  }, [userLocation, pathProgress]);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      if (lat && lng) {
        setUserLocation({ lat, lng });
      } else {
        setUserLocation({ lat: 53.1235, lng: 18.0084 });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        if (lat && lng) {
          setUserLocation({ lat, lng });
        } else {
          setUserLocation({ lat: 53.1235, lng: 18.0084 });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
      },
      (error) => {
        console.error("Error watching location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [lat, lng]);

  const playAudio = useCallback((audioUrl: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      currentlyPlayingAudioRef.current = audioUrl;

      const fullAudioUrl = `${getAPIBaseURL()}${audioUrl}`;
      console.log("[Map] Playing audio:", fullAudioUrl);

      const audio = new Audio(fullAudioUrl);
      audioRef.current = audio;

      audio.play().catch((error) => {
        console.error("[Map] Error playing audio:", error);
        currentlyPlayingAudioRef.current = null;
        audioRef.current = null;
      });

      audio.addEventListener("ended", () => {
        currentlyPlayingAudioRef.current = null;
        audioRef.current = null;
      });

      audio.addEventListener("error", (error) => {
        console.error("[Map] Audio playback error:", error);
        currentlyPlayingAudioRef.current = null;
        audioRef.current = null;
      });
    } catch (error) {
      console.error("[Map] Error setting up audio:", error);
      currentlyPlayingAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      currentlyPlayingAudioRef.current = null;
    };
  }, []);

  const handleMarkVisited = useCallback(async (stop: PathProgress["path"]["stops"][0]) => {
    if (!pathProgress || markingVisited || isMarkingVisitedRef.current) {
      console.log("[Map] handleMarkVisited: Already processing, ignoring click");
      return;
    }

    isMarkingVisitedRef.current = true;
    setMarkingVisited(true);

    setShowCharacterDialog(false);
    setSelectedStop(null);

    try {
      const result = await markPointVisited(stop.point_id, pathProgress.progress.id);
      if (result.success) {
        if (stop.reward_label || stop.reward_icon_url) {
          setRewardData({
            label: stop.reward_label || undefined,
            iconUrl: stop.reward_icon_url || undefined,
          });
          setShowRewardNotification(true);
          setTimeout(() => {
            setShowRewardNotification(false);
            setRewardData(null);
          }, 3000);
        }

        const updatedProgress = await getActivePathProgress();
        if (updatedProgress) {
          setPathProgress(updatedProgress);
        }

        if (result.isCompleted) {
        }
      } else {
        console.error("[Map] Failed to mark point as visited:", result.error);
        setShowCharacterDialog(true);
        setSelectedStop(stop);
      }
    } catch (error) {
      console.error("[Map] Error marking point as visited:", error);
      setShowCharacterDialog(true);
      setSelectedStop(stop);
    } finally {
      setMarkingVisited(false);
      isMarkingVisitedRef.current = false;
    }
  }, [pathProgress, markingVisited]);

  useEffect(() => {
    if (!userLocation || !pathProgress || showCharacterDialog) return;

    const checkGeofences = () => {
      if (!pathProgress) return;

      const unvisitedStops = pathProgress.path.stops.filter((stop) => !stop.visited);

      for (const stop of unvisitedStops) {
        const radius = stop.radius_meters || 50;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          stop.map_marker.coordinates.latitude,
          stop.map_marker.coordinates.longitude
        );

        if (__DEV__) {
          console.log(
            `[Geofence] Stop: ${stop.name}, Distance: ${distance.toFixed(
              2,
            )}m, Radius: ${radius}m, Within: ${distance <= radius}`,
          );
        }

        if (distance <= radius) {
          console.log(`[Geofence] ✅ TRIGGERED for stop: ${stop.name}`);
          console.log(`[Geofence] Stop has character:`, stop.character ? "YES" : "NO");
          console.log(
            `[Geofence] Stop character data:`,
            JSON.stringify(stop.character, null, 2),
          );
          console.log(
            `[Geofence] Setting selectedStop and showCharacterDialog to true`,
          );
          setSelectedStop(stop);
          setShowCharacterDialog(true);
          console.log(`[Geofence] State updated - dialog should appear now`);

          if (stop.audio_url && stop.audio_url !== currentlyPlayingAudioRef.current) {
            playAudio(stop.audio_url);
          }

          break;
        }
      }
    };

    checkGeofences();

    geofenceCheckIntervalRef.current = window.setInterval(checkGeofences, 2000);

    return () => {
      if (geofenceCheckIntervalRef.current !== null) {
        clearInterval(geofenceCheckIntervalRef.current);
      }
    };
  }, [userLocation, pathProgress, showCharacterDialog]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || !userLocation)
      return;

    const loadMapLibre = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).maplibregl) {
          resolve();
          return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadMapLibre().then(() => {
      const maplibregl = (window as any).maplibregl;
      if (!maplibregl || !mapRef.current) return;

      const defaultStyle = {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
        glyphs:
          "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      };

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: defaultStyle,
        center: [userLocation.lng, userLocation.lat],
        zoom: defaultZoom,
        pitch: 45,
        bearing: 0,
      });

      map.on("load", () => {
        const markerElement = document.createElement("div");
        markerElement.style.width = "48px";
        markerElement.style.height = "48px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.backgroundColor = COLORS.blue;
        markerElement.style.border = "3px solid white";
        markerElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        markerElement.style.display = "flex";
        markerElement.style.alignItems = "center";
        markerElement.style.justifyContent = "center";
        markerElement.style.fontSize = "18px";
        markerElement.style.fontWeight = "bold";
        markerElement.style.color = "white";
        markerElement.style.cursor = "pointer";
        markerElement.textContent = userInitials;

        markerRef.current = new maplibregl.Marker({
          element: markerElement,
          anchor: "center",
        })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map);

        routePinsRef.current = routePins.map((pin) => {
          const { bg, ring } = getPinColors(pin.variant);
          const pinElement = document.createElement("div");
          pinElement.style.width = "40px";
          pinElement.style.height = "40px";
          pinElement.style.borderRadius = "50%";
          pinElement.style.border = `2px solid ${ring}`;
          pinElement.style.backgroundColor = "white";
          pinElement.style.display = "flex";
          pinElement.style.alignItems = "center";
          pinElement.style.justifyContent = "center";
          pinElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.25)";

          const innerCircle = document.createElement("div");
          innerCircle.style.width = "30px";
          innerCircle.style.height = "30px";
          innerCircle.style.borderRadius = "50%";
          innerCircle.style.backgroundColor = bg;
          innerCircle.style.display = "flex";
          innerCircle.style.alignItems = "center";
          innerCircle.style.justifyContent = "center";

          if (pin.imageSource && typeof pin.imageSource === "object" && "uri" in pin.imageSource) {
            const img = document.createElement("img");
            img.src = pin.imageSource.uri;
            img.style.width = "22px";
            img.style.height = "22px";
            img.style.borderRadius = "11px";
            img.style.objectFit = "cover";
            innerCircle.appendChild(img);
          } else {
            innerCircle.style.fontSize = "16px";
            innerCircle.style.fontWeight = "700";
            innerCircle.style.color = "#FFFFFF";
            innerCircle.textContent = pin.label || "";
          }

          pinElement.appendChild(innerCircle);

          return new maplibregl.Marker({
            element: pinElement,
            anchor: "center",
          })
            .setLngLat([pin.lng, pin.lat])
            .addTo(map);
        });

        if (routeCoordinates.length >= 2) {
          const routeGeoJson = {
            type: "Feature" as const,
            properties: {},
            geometry: {
              type: "LineString" as const,
              coordinates: routeCoordinates.map((coord) => [coord.longitude, coord.latitude]),
            },
          };

          map.addSource("route", {
            type: "geojson",
            data: routeGeoJson as any,
          });

          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": COLORS.blue,
              "line-width": 4,
            },
          });
        }
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
      };
    });
  }, [userLocation, defaultZoom, userInitials]);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      mapRef.current.style.filter = "none";
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || routeCoordinates.length < 2) return;

    const map = mapInstanceRef.current;

    if (map.getSource("route")) {
      const routeGeoJson = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: routeCoordinates.map((coord) => [coord.longitude, coord.latitude]),
        },
      };
      (map.getSource("route") as any).setData(routeGeoJson as any);
    } else {
      const routeGeoJson = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: routeCoordinates.map((coord) => [coord.longitude, coord.latitude]),
        },
      };

      map.addSource("route", {
        type: "geojson",
        data: routeGeoJson as any,
      });

      if (!map.getLayer("route-line")) {
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": COLORS.blue,
            "line-width": 4,
          },
        });
      }
    }
  }, [routeCoordinates, isLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && isLoaded && userLocation) {
      if (markerRef.current) {
        markerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }

      mapInstanceRef.current.easeTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: defaultZoom,
        pitch: 45,
        duration: 500,
      });
    }
  }, [userLocation, defaultZoom, isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !pathProgress) return;

    const map = mapInstanceRef.current;

    if (map.getLayer("radius-circles")) {
      map.removeLayer("radius-circles");
    }
    if (map.getSource("radius-circles")) {
      map.removeSource("radius-circles");
    }

    const circles = pathProgress.path.stops.map((stop) => {
      const radius = stop.radius_meters || 50;
      const isVisited = stop.visited;
      const isNext = !isVisited && pathProgress.path.stops.findIndex((s) => !s.visited) === pathProgress.path.stops.indexOf(stop);

      const center = [stop.map_marker.coordinates.longitude, stop.map_marker.coordinates.latitude];
      const points = 64;
      const coordinates: [number, number][] = [];

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const latOffset = (radius / 111000) * Math.cos(angle);
        const lngOffset =
          (radius /
            (111000 * Math.cos((stop.map_marker.coordinates.latitude * Math.PI) / 180))) *
          Math.sin(angle);
        coordinates.push([
          center[0] + lngOffset,
          center[1] + latOffset,
        ]);
      }

      return {
        type: "Feature" as const,
        properties: {
          isVisited,
          isNext,
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [coordinates],
        },
      };
    });

    const circlesGeoJson = {
      type: "FeatureCollection" as const,
      features: circles,
    };

    map.addSource("radius-circles", {
      type: "geojson",
      data: circlesGeoJson as any,
    });

    map.addLayer({
      id: "radius-circles",
      type: "fill",
      source: "radius-circles",
      paint: {
        "fill-color": [
          "case",
          ["get", "isVisited"],
          "rgba(156, 163, 175, 0.2)",
          ["get", "isNext"],
          "rgba(237, 28, 36, 0.15)",
          "rgba(255, 222, 0, 0.15)",
        ],
        "fill-outline-color": [
          "case",
          ["get", "isVisited"],
          "#9CA3AF",
          ["get", "isNext"],
          COLORS.red,
          COLORS.yellow,
        ],
      },
    });

    map.addLayer({
      id: "radius-circles-stroke",
      type: "line",
      source: "radius-circles",
      paint: {
        "line-color": [
          "case",
          ["get", "isVisited"],
          "#9CA3AF",
          ["get", "isNext"],
          COLORS.red,
          COLORS.yellow,
        ],
        "line-width": 2,
      },
    });
  }, [pathProgress, isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const map = mapInstanceRef.current;

    routePinsRef.current.forEach((marker) => {
      marker.remove();
    });
    routePinsRef.current = [];

    if (routePins.length > 0) {
      const maplibregl = (window as any).maplibregl;
      if (!maplibregl) return;

      routePinsRef.current = routePins.map((pin) => {
        const { bg, ring } = getPinColors(pin.variant);
        const pinElement = document.createElement("div");
        pinElement.style.width = "40px";
        pinElement.style.height = "40px";
        pinElement.style.borderRadius = "50%";
        pinElement.style.border = `2px solid ${ring}`;
        pinElement.style.backgroundColor = "white";
        pinElement.style.display = "flex";
        pinElement.style.alignItems = "center";
        pinElement.style.justifyContent = "center";
        pinElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.25)";

        const innerCircle = document.createElement("div");
        innerCircle.style.width = "30px";
        innerCircle.style.height = "30px";
        innerCircle.style.borderRadius = "50%";
        innerCircle.style.backgroundColor = bg;
        innerCircle.style.display = "flex";
        innerCircle.style.alignItems = "center";
        innerCircle.style.justifyContent = "center";

        if (pin.imageSource && typeof pin.imageSource === "object" && "uri" in pin.imageSource) {
          const img = document.createElement("img");
          img.src = pin.imageSource.uri;
          img.style.width = "22px";
          img.style.height = "22px";
          img.style.borderRadius = "11px";
          img.style.objectFit = "cover";
          innerCircle.appendChild(img);
        } else {
          innerCircle.style.fontSize = "16px";
          innerCircle.style.fontWeight = "700";
          innerCircle.style.color = "#FFFFFF";
          innerCircle.textContent = pin.label || "";
        }

        pinElement.appendChild(innerCircle);

        return new maplibregl.Marker({
          element: pinElement,
          anchor: "center",
        })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map);
      });
    }
  }, [routePins, isLoaded]);

  if (!userLocation) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#E8F0E8",
          color: "#4A4A4A",
        }}
      >
        <div>Loading location...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: isLoaded ? "100%" : "400px",
        backgroundColor: "#E8F0E8",
        overflow: "hidden",
      }}
    >
      <div
        ref={mapRef}
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        {!isLoaded && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#E8F0E8",
              color: "#4A4A4A",
            }}
          >
            <div>Loading map...</div>
          </div>
        )}
      </div>

      {hasRoute && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 16,
            right: 16,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.96)",
            padding: "10px 14px 12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 6,
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111827",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {routeTitle}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "#6B7280",
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {progressText}
              </div>
            </div>

            <div
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: COLORS.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
              }}
            >
              {Math.round(progressRatio * 100)}%
            </div>
          </div>

          <div
            style={{
              height: 5,
              borderRadius: 999,
              backgroundColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressRatio * 100}%`,
                backgroundColor: COLORS.blue,
                transition: "width 200ms ease-out",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 10,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: "#F3F4F6",
                border: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.blue }}>
                ↱
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6B7280",
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                Następny manewr
                {nextStepDistance ? ` • za ${nextStepDistance}` : ""}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#111827",
                  marginTop: 2,
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {nextStepText}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={openInGoogleMaps}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #E5E7EB",
                backgroundColor: "#F9FAFB",
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.blue,
                cursor: "pointer",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Otwórz w Google Maps
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => adjustZoom("in")}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            cursor: "pointer",
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.red,
          }}
        >
          ＋
        </button>

        <button
          onClick={() => adjustZoom("out")}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            cursor: "pointer",
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.red,
          }}
        >
          －
        </button>

        <button
          onClick={goToMyLocation}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            cursor: "pointer",
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.red,
          }}
        >
          ⌖
        </button>

        {__DEV__ && pathProgress && pathProgress.path.stops.length > 0 && (
          <button
            onClick={() => {
              const firstStop = pathProgress.path.stops.find((stop) => !stop.visited) 
                || pathProgress.path.stops[0];

              if (firstStop) {
                const radius = firstStop.radius_meters || 50;
                const latOffset = (radius * 0.5) / 111000;
                const lngOffset =
                  (radius * 0.5) /
                  (111000 *
                    Math.cos(
                      (firstStop.map_marker.coordinates.latitude *
                        Math.PI) /
                        180,
                    ));

                const newLocation = {
                  lat: firstStop.map_marker.coordinates.latitude + latOffset,
                  lng: firstStop.map_marker.coordinates.longitude + lngOffset,
                };

                console.log("[DEBUG] Moving to stop:", firstStop.name);
                console.log("[DEBUG] Stop location:", firstStop.map_marker.coordinates);
                console.log("[DEBUG] New user location:", newLocation);
                console.log("[DEBUG] Radius:", radius, "meters");

                setUserLocation(newLocation);

                if (mapInstanceRef.current) {
                  mapInstanceRef.current.easeTo({
                    center: [newLocation.lng, newLocation.lat],
                    zoom: defaultZoom,
                    duration: 500,
                  });
                }

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
                      console.log("[DEBUG] Stop has character:", stop.character ? "YES" : "NO");
                      setSelectedStop(stop);
                      setShowCharacterDialog(true);

                      if (stop.audio_url && stop.audio_url !== currentlyPlayingAudioRef.current) {
                        playAudio(stop.audio_url);
                      }

                      break;
                    }
                  }
                }, 600);
              }
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: COLORS.yellow,
              border: "3px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            🐛
          </button>
        )}
      </div>

      {showCharacterDialog && selectedStop && (
        <div
          style={{
            position: "fixed",
            bottom: 120,
            right: 16,
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 12,
            maxWidth: "85%",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              marginBottom: 8,
            }}
          >
            {selectedStop.character ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.default, marginBottom: 4 }}>
                  {selectedStop.character.name}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.blue, marginBottom: 8 }}>
                  {selectedStop.character.description}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.default, marginBottom: 4 }}>
                  {selectedStop.name}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.blue, marginBottom: 8 }}>
                  Przystanek na trasie
                </div>
              </>
            )}
            <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 12 }}>
              {selectedStop.place_description}
            </div>
            <button
              onClick={() => handleMarkVisited(selectedStop)}
              disabled={markingVisited}
              style={{
                backgroundColor: COLORS.red,
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                cursor: markingVisited ? "not-allowed" : "pointer",
                opacity: markingVisited ? 0.6 : 1,
                width: "100%",
              }}
            >
              {markingVisited ? "Zapisywanie..." : "Oznacz jako odwiedzone"}
            </button>
          </div>

          {selectedStop.character && selectedStop.character.avatarUrl ? (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                border: "3px solid #FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                overflow: "hidden",
              }}
            >
              <img
                src={`${getAPIBaseURL()}${selectedStop.character.avatarUrl}`}
                alt={selectedStop.character.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  console.error("[Map] Error loading character avatar:", e);
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: COLORS.blue,
                border: "3px solid #FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 700 }}>📍</span>
            </div>
          )}
        </div>
      )}

      {showRewardNotification && rewardData && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: 16,
            right: 16,
            backgroundColor: COLORS.yellow,
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1001,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            {rewardData.iconUrl ? (
              <img
                src={`${getAPIBaseURL()}${rewardData.iconUrl}`}
                alt="Reward"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  border: "2px solid #FFFFFF",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFFFFF",
                }}
              >
                <span style={{ fontSize: 24 }}>🎁</span>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.default,
                  marginLeft: 12,
                }}
              >
                Otrzymałeś nagrodę{rewardData.label ? `: ${rewardData.label}` : "!"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
