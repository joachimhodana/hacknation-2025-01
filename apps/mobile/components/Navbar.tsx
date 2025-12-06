import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  textDark: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  bgSoft: "#F3F4F6",
};

type NavItem = {
  label: string;
  route: string;
  icon: string;
};

const navItems: NavItem[] = [
  { label: "Map", route: "/map", icon: "🗺️" },
  { label: "Explore", route: "/explore", icon: "🔍" },
  { label: "Profile", route: "/profile", icon: "👤" },
  { label: "Collection", route: "/collections", icon: "📦" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (route: string) => {
    // Use replace to avoid stacking navigation history
    if (pathname !== route) {
      router.replace(route);
    }
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => handleNavigate(item.route)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 20, // Add extra padding for safe area on iOS
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000, // Ensure navbar is always on top
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: COLORS.bgSoft,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  labelActive: {
    color: COLORS.red,
    fontWeight: "600",
  },
});

