import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Platform, ActivityIndicator, View, Text } from "react-native";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Camera, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { authClient } from "@/lib/auth-client";

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
  const { data: session } = authClient.useSession();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  
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

      // Get initial location
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

      // Watch location in real-time
      try {
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Update every second
            distanceInterval: 1, // Update every meter
          },
          (location) => {
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          }
        );
      } catch (error) {
        console.error("Error watching location:", error);
      }
    })();

    // Cleanup subscription on unmount
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  // Update camera to follow user location in real-time
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
        { duration: 500 } // Faster update for real-time tracking
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
      region={{
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta,
        longitudeDelta,
      }}
      showsUserLocation={false}
      showsMyLocationButton={true}
      showsCompass={true}
      zoomEnabled={true}
      scrollEnabled={true}
      rotateEnabled={true}
      pitchEnabled={true}
      // Subtle, natural theme
      mapType={Platform.OS === "ios" ? "standard" : "standard"}
      customMapStyle={Platform.OS === "android" ? subtleStyle : undefined}
    >
      {/* Custom marker with user avatar */}
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
    </MapView>
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
  avatarMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#9BCF7F",
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
});

export default Map;
