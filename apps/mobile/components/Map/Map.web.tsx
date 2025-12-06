import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDeviceDetection } from "@/hooks/use-device-detection";

export type MapProps = {
  lat?: number;
  lng?: number;
  zoom?: number;
};

export const Map: React.FC<MapProps> = ({ lat, lng, zoom }) => {
  const { isMobile } = useDeviceDetection();
  // Adjust default zoom based on device type
  const defaultZoom = useMemo(() => zoom ?? (isMobile ? 15 : 13), [zoom, isMobile]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapInstanceRef = useRef<any>(null);

  // Get user location
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [lat, lng]);

  useEffect(() => {
    // Only run on client and when we have location
    if (typeof window === "undefined" || !mapRef.current || !userLocation) return;

    // Load MapLibre GL JS for true 3D support
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
        link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
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
          "osm": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 22
          }
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
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

      // Subtle color enhancements (not too vibrant)
      map.on("load", () => {
        // Natural, subtle color adjustments
        if (map.getLayer("osm-layer")) {
          map.setPaintProperty("osm-layer", "raster-opacity", 1.0);
          map.setPaintProperty("osm-layer", "raster-brightness-min", 0.0);
          map.setPaintProperty("osm-layer", "raster-brightness-max", 1.0);
          map.setPaintProperty("osm-layer", "raster-saturation", 0.1); // Very subtle saturation increase
        }

        // Add subtle marker for user location
        new maplibregl.Marker({
          color: "#9BCF7F",
          scale: 1.0,
        })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map);
      });

      // Very subtle color filter (natural look)
      const mapContainer = mapRef.current;
      if (mapContainer) {
        // Subtle enhancement - not too vibrant
        mapContainer.style.filter = "saturate(1.1) contrast(1.05) brightness(1.02)";
      }

      mapInstanceRef.current = map;
      setIsLoaded(true);

      // Cleanup
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
      };
    });
  }, [userLocation, defaultZoom]);

  // Update map when location changes
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded && userLocation) {
      mapInstanceRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: defaultZoom,
        pitch: 45, // Maintain 3D view
        duration: 1000,
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
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: isLoaded ? "100%" : "400px",
        backgroundColor: "#E8F0E8",
        overflow: "hidden",
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
  );
};

export default Map;
