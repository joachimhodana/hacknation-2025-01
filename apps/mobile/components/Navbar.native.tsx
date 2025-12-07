import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
  iconName: keyof typeof Ionicons.glyphMap;
  iconNameActive: keyof typeof Ionicons.glyphMap;
};

const navItems: NavItem[] = [
  { 
    label: "Mapa", 
    route: "/map", 
    iconName: "map-outline",
    iconNameActive: "map"
  },
  { 
    label: "Włóczykij", 
    route: "/explore", 
    iconName: "compass-outline",
    iconNameActive: "compass"
  },
  { 
    label: "Profil", 
    route: "/profile", 
    iconName: "person-outline",
    iconNameActive: "person"
  },
  { 
    label: "Skarbnica", 
    route: "/collections", 
    iconName: "cube-outline",
    iconNameActive: "cube"
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (route: string) => {
    if (pathname !== route) {
      router.replace(route as any);
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
            <Ionicons
              name={isActive ? item.iconNameActive : item.iconName}
              size={24}
              color={isActive ? COLORS.red : COLORS.textMuted}
              style={styles.icon}
            />
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
    paddingBottom: 20,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
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