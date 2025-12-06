import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDeviceDetection } from "@/hooks/use-device-detection";

export type MapProps = {
  lat: number;
  lng: number;
  zoom?: number;
};

export const Map: React.FC<MapProps> = ({ lat, lng, zoom }) => {
  const { isMobile } = useDeviceDetection();
  // Adjust default zoom based on device type
  const defaultZoom = useMemo(() => zoom ?? (isMobile ? 15 : 13), [zoom, isMobile]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || !mapRef.current) return;

    // Load Leaflet from CDN
    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        // Check if already loaded
        if ((window as any).L) {
          resolve();
          return;
        }

        // Load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current).setView([lat, lng], defaultZoom);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add marker
      L.marker([lat, lng]).addTo(map);

      mapInstanceRef.current = map;
      setIsLoaded(true);

      // Cleanup
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
      };
    });
  }, [lat, lng, defaultZoom]);

  // Update map when props change
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setView([lat, lng], defaultZoom);
    }
  }, [lat, lng, defaultZoom, isLoaded]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: isLoaded ? "100%" : "400px",
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
          }}
        >
          <div>Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default Map;
