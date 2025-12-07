import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { authClient } from "@/lib/auth-client";

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

// zoom po stronie kamery
const MIN_ZOOM = 13;
const MAX_ZOOM = 19;
const ZOOM_STEP = 0.6;

export const Map: React.FC<MapProps> = ({ lat, lng, zoom }) => {
  const { isMobile } = useDeviceDetection();
  const { data: session } = authClient.useSession();

  // Adjust default zoom based on device type
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

  // Get user info for avatar
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

  // 🔹 Mock aktywnej trasy – podmień na realne dane (API / store)
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
    window.open(url, '_blank');
  };

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

  // Watch user location in real-time
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      // Fallback to provided coordinates or default
      if (lat && lng) {
        setUserLocation({ lat, lng });
      } else {
        // Default to Bydgoszcz
        setUserLocation({ lat: 53.1235, lng: 18.0084 });
      }
      return;
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        // Fallback to provided coordinates or default
        if (lat && lng) {
          setUserLocation({ lat, lng });
        } else {
          setUserLocation({ lat: 53.1235, lng: 18.0084 });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    // Watch position changes in real-time
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

    // Cleanup watch on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [lat, lng]);

  useEffect(() => {
    // Only run on client and when we have location
    if (typeof window === "undefined" || !mapRef.current || !userLocation)
      return;

    const loadMapLibre = () => {
      return new Promise<void>((resolve) => {
        // Check if already loaded
        if ((window as any).maplibregl) {
          resolve();
          return;
        }

        // Load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadMapLibre().then(() => {
      const maplibregl = (window as any).maplibregl;
      if (!maplibregl || !mapRef.current) return;

      // Default OpenStreetMap style
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

      // Initialize map with 3D support
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: defaultStyle,
        center: [userLocation.lng, userLocation.lat],
        zoom: defaultZoom,
        pitch: 45, // True 3D 45-degree tilt
        bearing: 0,
      });

      map.on("load", () => {
        // Custom marker with user avatar
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

        // Add route pins
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
          innerCircle.style.fontSize = "16px";
          innerCircle.style.fontWeight = "700";
          innerCircle.style.color = "#FFFFFF";
          innerCircle.textContent = pin.label || "";
          
          pinElement.appendChild(innerCircle);

          return new maplibregl.Marker({
            element: pinElement,
            anchor: "center",
          })
            .setLngLat([pin.lng, pin.lat])
            .addTo(map);
        });

        // Add route line if coordinates are available
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

      // Cleanup map instance on unmount
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
      };
    });
  }, [userLocation, defaultZoom, userInitials]);

  // Remove dark theme filter when map is loaded
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      mapRef.current.style.filter = "none";
    }
  }, [isLoaded]);

  // Update route line when coordinates change
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

  // Update map and marker when location changes
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded && userLocation) {
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }

      // Smoothly center map on user location
      mapInstanceRef.current.easeTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: defaultZoom,
        pitch: 45,
        duration: 500,
      });
    }
  }, [userLocation, defaultZoom, isLoaded]);

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
      {/* Kontener mapy */}
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

      {/* 🏝️ Pływająca wyspa z info o trasie – ten sam motyw co w appce */}
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
          {/* Treść */}
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
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {routeTitle}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "#6B7280",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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

          {/* Pasek postępu */}
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

          {/* Next turn info */}
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
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {nextStepText}
              </div>
            </div>
          </div>

          {/* Google Maps CTA */}
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
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Otwórz w Google Maps
            </button>
          </div>
        </div>
      )}

      {/* Kontrolki mapy */}
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
      </div>
    </div>
  );
};

export default Map;
