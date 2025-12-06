import React from "react";
import { StyleSheet, Platform } from "react-native";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";

export type MapProps = {
  lat: number;
  lng: number;
  zoom?: number;
};

export const Map: React.FC<MapProps> = ({ lat, lng, zoom = 13 }) => {
  // Calculate delta based on zoom level
  const latitudeDelta = 0.0922 / (zoom / 13);
  const longitudeDelta = 0.0421 / (zoom / 13);

  return (
    <MapView
      style={styles.map}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      initialRegion={{
        latitude: lat,
        longitude: lng,
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
    />
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default Map;

