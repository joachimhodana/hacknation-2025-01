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

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
};

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

      // Subtle, natural style
      const subtleStyle = {
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
        style: subtleStyle,
        center: [userLocation.lng, userLocation.lat],
        zoom: defaultZoom,
        pitch: 45, // True 3D 45-degree tilt
        bearing: 0,
      });

      map.on("load", () => {
        // Slight raster tuning
        if (map.getLayer("osm-layer")) {
          map.setPaintProperty("osm-layer", "raster-opacity", 1.0);
          map.setPaintProperty("osm-layer", "raster-brightness-min", 0.0);
          map.setPaintProperty("osm-layer", "raster-brightness-max", 1.0);
          map.setPaintProperty("osm-layer", "raster-saturation", 0.1);
        }

        // Custom marker with user avatar
        const markerElement = document.createElement("div");
        markerElement.style.width = "48px";
        markerElement.style.height = "48px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.backgroundColor = "#9BCF7F";
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
      });

      // Very subtle color filter
      if (mapRef.current) {
        mapRef.current.style.filter =
          "saturate(1.1) contrast(1.05) brightness(1.02)";
      }

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
            top: 16,
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
          {/* Pasek akcentu */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              height: 3,
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <div
              style={{ flex: 1, backgroundColor: COLORS.red }}
            />
            <div
              style={{ flex: 1, backgroundColor: COLORS.yellow }}
            />
            <div
              style={{ flex: 1, backgroundColor: COLORS.blue }}
            />
          </div>

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
                }}
              >
                {routeTitle}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "#6B7280",
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
        </div>
      )}
    </div>
  );
};

export default Map;
