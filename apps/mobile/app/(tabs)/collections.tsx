import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  textDark: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  cardBg: "#FFFFFF",
  softBg: "#F3F4F6",
};

type CollectedItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  collected: boolean;
};

const items: CollectedItem[] = [
  {
    id: "golden-crown",
    title: "Złota Korona",
    description: "Symbol królewskiej historii miasta.",
    emoji: "👑",
    collected: true,
  },
  {
    id: "river-stone",
    title: "Kamień znad Brdy",
    description: "Wygładzony przez nurt rzeki.",
    emoji: "🪨",
    collected: false,
  },
  {
    id: "old-ticket",
    title: "Stary bilet tramwajowy",
    description: "Relikt dawnej komunikacji miejskiej.",
    emoji: "🎫",
    collected: false,
  },
  {
    id: "mill-island-leaf",
    title: "Liść z Wyspy Młyńskiej",
    description: "Pamiątka ze spaceru po sercu miasta.",
    emoji: "🍃",
    collected: true,
  },
];

const CollectionsScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background blobs */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Wróć</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zebrane przedmioty</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Pełna lista przedmiotów, które możesz znaleźć w mieście. Później
          możesz tu dodać filtry, wyszukiwarkę itd.
        </Text>

        <View style={styles.itemsGrid}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                !item.collected && styles.itemLocked,
              ]}
            >
              <View style={styles.itemImageWrapper}>
                <View
                  style={[
                    styles.itemImage,
                    !item.collected && styles.itemImageLocked,
                  ]}
                >
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>
              </View>

              <View style={styles.itemTextWrapper}>
                <Text
                  style={[
                    styles.itemTitle,
                    !item.collected && styles.itemTitleLocked,
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.itemDescription,
                    !item.collected && styles.itemDescriptionLocked,
                  ]}
                >
                  {item.description}
                </Text>
              </View>

              <View style={styles.itemStatusWrapper}>
                <Text
                  style={[
                    styles.itemStatus,
                    item.collected
                      ? styles.itemStatusCollected
                      : styles.itemStatusMissing,
                  ]}
                >
                  {item.collected ? "Zebrano" : "Brakuje"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CollectionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // blobs
  blob: {
    position: "absolute",
    opacity: 0.28,
    borderRadius: 999,
  },
  blobRed: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.red,
    top: -50,
    right: -80,
  },
  blobBlue: {
    width: 180,
    height: 180,
    backgroundColor: COLORS.blue,
    top: 140,
    left: -60,
  },
  blobYellow: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.yellow,
    bottom: 60,
    right: -40,
  },

  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
  },

  itemsGrid: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  itemLocked: {
    opacity: 0.6,
  },
  itemImageWrapper: {
    width: 58,
    height: 58,
  },
  itemImage: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.softBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemImageLocked: {
    backgroundColor: "#F0F0F0",
  },
  itemEmoji: {
    fontSize: 30,
  },
  itemTextWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  itemTitleLocked: {
    color: "#9CA3AF",
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemDescriptionLocked: {
    color: "#B3B9C4",
  },
  itemStatusWrapper: {
    alignItems: "flex-end",
  },
  itemStatus: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  itemStatusCollected: {
    color: COLORS.blue,
  },
  itemStatusMissing: {
    color: COLORS.red,
  },
});
