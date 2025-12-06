// app/(tabs)/profile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
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

type LanguageCode = "pl" | "en";

// 👇 export this so collections.tsx can reuse the type
export type CollectedItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  collected: boolean;
  placeName?: string;
  collectedAt?: string;
};

// 👇 export this so collections.tsx can reuse the test data
export const items: CollectedItem[] = [
  {
    id: "golden-crown",
    title: "Złota Korona",
    description: "Symbol królewskiej historii miasta.",
    emoji: "👑",
    collected: true,
    placeName: "Stary Rynek",
    collectedAt: "2025-02-01",
  },
  {
    id: "river-stone",
    title: "Kamień znad Brdy",
    description: "Wygładzony przez nurt rzeki.",
    emoji: "🪨",
    collected: false,
    placeName: "Nabrzeże Brdy",
  },
  {
    id: "old-ticket",
    title: "Stary bilet tramwajowy",
    description: "Relikt dawnej komunikacji miejskiej.",
    emoji: "🎫",
    collected: false,
    placeName: "Zajezdnia tramwajowa",
  },
  {
    id: "mill-island-leaf",
    title: "Liść z Wyspy Młyńskiej",
    description: "Pamiątka ze spaceru po sercu miasta.",
    emoji: "🍃",
    collected: true,
    placeName: "Wyspa Młyńska",
    collectedAt: "2025-02-03",
  },
];

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<LanguageCode>("pl");

  const collected = items.filter((i) => i.collected);
  const previewItems = collected.slice(0, 3);

  const handleLogout = () => {
    // TODO: real logout logic
    console.log("Logout tapped");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background blobs */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header / Profile text */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profil gracza</Text>
          <Text style={styles.pageSubtitle}>
            Zobacz swoje przedmioty, postęp i ustawienia gry.
          </Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCardOuter}>
          <View style={styles.accentStrip}>
            <View style={[styles.accentSegment, { backgroundColor: COLORS.red }]} />
            <View
              style={[styles.accentSegment, { backgroundColor: COLORS.yellow }]}
            />
            <View style={[styles.accentSegment, { backgroundColor: COLORS.blue }]} />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>BK</Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.playerName}>Bydgoski Król</Text>
                <Text style={styles.playerSubtitle}>
                  Poziom 3 • Odkrywca miasta
                </Text>

                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressLabel}>
                  60% do kolejnego poziomu
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>odwiedzone miejsca</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{collected.length}</Text>
                <Text style={styles.statLabel}>przedmioty zebrane</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>2.4 km</Text>
                <Text style={styles.statLabel}>przespacerowane</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Collections / items – 3 in a row preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Zebrane przedmioty</Text>
            <TouchableOpacity onPress={() => router.push("/collections")}>
              <Text style={styles.showAllText}>Pokaż wszystkie ›</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionSubtitle}>
            Podgląd zebranych przedmiotów. Kliknij „Pokaż wszystkie”, żeby
            zobaczyć więcej.
          </Text>

          <View style={styles.itemsGridPreview}>
            {previewItems.map((item) => (
              <View key={item.id} style={styles.itemTilePreview}>
                <View style={styles.itemTileInner}>
                  <Text style={styles.itemTileEmoji}>{item.emoji}</Text>
                </View>
              </View>
            ))}
            {previewItems.length < 3 &&
              Array.from({ length: 3 - previewItems.length }).map((_, idx) => (
                <View key={`phantom-${idx}`} style={styles.itemTilePreviewPhantom} />
              ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ustawienia</Text>

          <View style={styles.settingsCard}>
            {/* Notifications */}
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View>
                <Text style={styles.settingLabel}>Powiadomienia</Text>
                <Text style={styles.settingValue}>
                  {notificationsEnabled ? "Włączone" : "Wyłączone"}
                </Text>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: "#D1D5DB",
                  true: COLORS.red,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Language segmented control */}
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View>
                <Text style={styles.settingLabel}>Język</Text>
                <Text style={styles.settingValue}>
                  {language === "pl" ? "Polski" : "English"}
                </Text>
              </View>

              <View style={styles.segmentWrapper}>
                <TouchableOpacity
                  style={[
                    styles.segment,
                    language === "pl" && styles.segmentActive,
                  ]}
                  onPress={() => setLanguage("pl")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      language === "pl" && styles.segmentTextActive,
                    ]}
                  >
                    PL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segment,
                    language === "en" && styles.segmentActive,
                  ]}
                  onPress={() => setLanguage("en")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      language === "en" && styles.segmentTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Privacy row */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => console.log("Open privacy settings")}
            >
              <View>
                <Text style={styles.settingLabel}>Prywatność i dane</Text>
                <Text style={styles.settingValue}>
                  Zarządzaj tym, co zapisujemy.
                </Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Wyloguj się</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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

  header: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  profileCardOuter: {
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  accentStrip: {
    flexDirection: "row",
    height: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  accentSegment: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 999,
    backgroundColor: COLORS.softBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  profileInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  playerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressBar: {
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.softBg,
    overflow: "hidden",
  },
  progressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: COLORS.red,
    borderRadius: 999,
  },
  progressLabel: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.softBg,
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: "center",
  },

  section: {
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  showAllText: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
  },

  // Preview grid: 3 in a row
  itemsGridPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTilePreview: {
    flex: 1,
    maxWidth: "31%",
    aspectRatio: 1,
  },
  itemTilePreviewPhantom: {
    flex: 1,
    maxWidth: "31%",
    aspectRatio: 1,
  },
  itemTileInner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: COLORS.softBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTileEmoji: {
    fontSize: 28,
  },

  // Settings
  settingsCard: {
    marginTop: 6,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  settingRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  settingValue: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 18,
    color: COLORS.textMuted,
  },

  segmentWrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.softBg,
    borderRadius: 999,
    padding: 2,
    gap: 4,
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: COLORS.red,
  },
  segmentText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "flex-start",
  },
  logoutText: {
    fontSize: 13,
    color: COLORS.red,
    fontWeight: "600",
  },
});
