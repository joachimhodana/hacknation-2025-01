import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Platform, ActivityIndicator, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Camera } from "react-native-maps";
import * as Location from "expo-location";

export type MapProps = {
  lat?: number;
  lng?: number;
  zoom?: number;
};

// Subtle, natural theme - similar to Apple Maps Pokemon Go style
const subtleStyle = [
  // Water - light blue (not too vibrant)
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#A8D5E2" }, { lightness: 20 }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5B8FA3" }],
  },
  // Parks/Grass - natural green (not neon)
  {
    featureType: "park",
    elementType: "geometry",
    stylers: [{ color: "#9BCF7F" }, { saturation: -10 }],
  },
  {
    featureType: "park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5A7A4A" }],
  },
  // Roads - light gray/white (subtle)
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#F8F8F8" }, { lightness: 5 }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#E8E8E8" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#F0F0F0" }],
  },
  // Buildings - neutral colors
  {
    featureType: "poi.business",
    elementType: "geometry",
    stylers: [{ color: "#E8E8E8" }, { lightness: 10 }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#D8D8D8" }],
  },
  // Land/background - neutral beige/teal
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#E8F0E8" }, { saturation: -20 }],
  },
  // Labels - readable but not too bold
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#4A4A4A" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#FFFFFF" }, { weight: 1.5 }],
  },
];

export const Map: React.FC<MapProps> = ({ lat, lng, zoom = 15 }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);
  
  // Calculate delta based on zoom level
  const latitudeDelta = 0.0922 / (zoom / 13);
  const longitudeDelta = 0.0421 / (zoom / 13);

  useEffect(() => {
    (async () => {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setLocationPermission(false);
        // Use fallback coordinates if permission denied
        if (lat && lng) {
          setUserLocation({ lat, lng });
        }
        return;
      }

      setLocationPermission(true);

      // Get current location
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        // Use fallback coordinates
        if (lat && lng) {
          setUserLocation({ lat, lng });
        }
      }
    })();
  }, []);

  // Update camera to 45-degree 3D view when location is available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          },
          pitch: 45, // True 3D 45-degree tilt
          heading: 0,
          altitude: 1000,
          zoom: zoom,
        },
        { duration: 1000 }
      );
    }
  }, [userLocation, zoom]);

  if (!userLocation) {
    return (
      <View style={[styles.map, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#9BCF7F" />
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      initialRegion={{
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta,
        longitudeDelta,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
      showsCompass={true}
      zoomEnabled={true}
      scrollEnabled={true}
      rotateEnabled={true}
      pitchEnabled={true}
      // Subtle, natural theme
      mapType={Platform.OS === "ios" ? "standard" : "standard"}
      customMapStyle={Platform.OS === "android" ? subtleStyle : undefined}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F0E8",
  },
});

export default Map;
