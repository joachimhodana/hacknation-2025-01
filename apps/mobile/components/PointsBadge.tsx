import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { authClient } from "@/lib/auth-client";
import { fetchUserStats } from "@/lib/api-client";

const COLORS = {
  yellow: "#FFDE00",
  textDark: "#111827",
};

interface PointsBadgeProps {
  showIcon?: boolean;
}

export function PointsBadge({ showIcon = false }: PointsBadgeProps) {
  const { data: session } = authClient.useSession();
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const calculatePoints = (
    completedPathsCount: number,
    collectedItemsCount: number,
    totalDistanceKm: number
  ): number => {
    const pathsPoints = completedPathsCount * 100;
    // Punkty za zebrane przedmioty: 50 pkt za każdy
    const itemsPoints = collectedItemsCount * 50;
    const distancePoints = Math.floor(totalDistanceKm) * 10;
    return pathsPoints + itemsPoints + distancePoints;
  };

  useEffect(() => {
    if (session && !session.user?.isAnonymous) {
      const loadPoints = async () => {
        try {
          const stats = await fetchUserStats();
          if (stats) {
            const calculatedPoints = calculatePoints(
              stats.completedPathsCount,
              stats.collectedItems.length,
              stats.totalDistanceKm
            );
            setPoints(calculatedPoints);
          }
        } catch (error) {
          console.error("Error loading points:", error);
        } finally {
          setLoading(false);
        }
      };
      loadPoints();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading || !session) {
    return null;
  }

  return (
    <View style={styles.pointsBadge}>
      {showIcon && <Text style={styles.pointsIcon}>⭐</Text>}
      <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pointsBadge: {
    position: "absolute",
    top: 50,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  pointsIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
  },
});

