// app/profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Navbar from "@/components/Navbar";
import { authClient } from "@/lib/auth-client";
import { fetchUserStats, type CollectedItem } from "@/lib/api-client";

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

// Export CollectedItem type for collections.tsx
export type { CollectedItem } from "@/lib/api-client";

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [stats, setStats] = useState<{
    completionPercentage: number;
    completedPathsCount: number;
    totalDistanceKm: number;
    collectedItems: CollectedItem[];
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  // Fetch user stats when session is available
  useEffect(() => {
    if (session && !isPending) {
      loadStats();
    }
  }, [session, isPending]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const userStats = await fetchUserStats();
      if (userStats) {
        setStats({
          completionPercentage: userStats.completionPercentage,
          completedPathsCount: userStats.completedPathsCount,
          totalDistanceKm: userStats.totalDistanceKm,
          collectedItems: userStats.collectedItems,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (isPending || statsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED1C24" />
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  const user = session.user;
  const isAnonymous = user?.isAnonymous || false;
  const userName = isAnonymous ? "Anonymous" : (user?.name || "Użytkownik");
  const userEmail = user?.email || "";
  const userInitials = isAnonymous ? "?" : (user?.name?.substring(0, 2).toUpperCase() || "??");

  const collectedItems = stats?.collectedItems || [];
  const previewItems = collectedItems.slice(0, 3);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
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

        {/* Anonymous user warning banner */}
        {isAnonymous && (
          <View style={styles.anonymousBanner}>
            <View style={styles.anonymousBannerContent}>
              <Text style={styles.anonymousBannerIcon}>⚠️</Text>
              <View style={styles.anonymousBannerText}>
                <Text style={styles.anonymousBannerTitle}>
                  Konto anonimowe
                </Text>
                <Text style={styles.anonymousBannerDescription}>
                  Twój postęp może nie być zapisany. Nie będziesz widoczny w
                  rankingach ani nie będziesz mógł wygrać nagród.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.anonymousBannerButton}
              onPress={handleGoToLogin}
            >
              <Text style={styles.anonymousBannerButtonText}>
                Zaloguj się
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
              <View style={[styles.avatar, isAnonymous && styles.avatarAnonymous]}>
                <Text style={styles.avatarInitials}>{userInitials}</Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.playerName}>{userName}</Text>
                <Text style={styles.playerSubtitle}>
                  {isAnonymous
                    ? "Konto anonimowe"
                    : userEmail
                    ? `${userEmail}`
                    : "Odkrywca miasta"}
                </Text>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${stats?.completionPercentage || 0}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {stats?.completionPercentage || 0}% ukończenia wszystkich tras
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {stats?.completedPathsCount || 0}
                </Text>
                <Text style={styles.statLabel}>skończone trasy</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {stats?.collectedItems.length || 0}
                </Text>
                <Text style={styles.statLabel}>przedmioty zebrane</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {stats?.totalDistanceKm.toFixed(1) || "0.0"} km
                </Text>
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
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Wyloguj się</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
      <Navbar />
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
    paddingBottom: 100, // Extra padding for absolute navbar
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
  avatarAnonymous: {
    backgroundColor: COLORS.bgSoft,
    borderColor: COLORS.textMuted,
    borderWidth: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  anonymousBanner: {
    marginBottom: 16,
    backgroundColor: "#FFF4E6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFD89B",
    padding: 14,
  },
  anonymousBannerContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  anonymousBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  anonymousBannerText: {
    flex: 1,
  },
  anonymousBannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  anonymousBannerDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  anonymousBannerButton: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  anonymousBannerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
