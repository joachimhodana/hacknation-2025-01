// screens/StartScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  textDark: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  bgSoft: "#F3F4F6",
};

export default function StartScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  // If user is already logged in, redirect to map
  useEffect(() => {
    if (!isPending && session) {
      console.log("[Index] Session found, redirecting to /map");
      router.replace("/map");
    } else if (!isPending && !session) {
      console.log("[Index] No session, showing start screen");
    }
  }, [session, isPending, router]);

  // Show loading while checking session
  if (isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED1C24" />
        </View>
      </SafeAreaView>
    );
  }

  // Don't show start screen if already logged in (will redirect)
  if (session) {
    return null;
  }

  const handleStartGuest = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.anonymous();
      router.replace("/map");
    } catch (error) {
      console.error("Anonymous signin error:", error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative background shapes */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Top section */}
          <View style={styles.header}>

            <Text style={styles.title}>Zacznij odkrywanie Bydgoszczy</Text>
            <Text style={styles.subtitle}>
              Odkrywaj muzea, pomniki i ukryte tajemnice miasta. Możesz zacząć
              od razu albo zalogować się, żeby zapisywać swój postęp.
            </Text>
          </View>

          {/* Card with choices */}
          <View style={styles.cardOuter}>
            <View style={styles.accentStrip}>
              <View
                style={[styles.accentSegment, { backgroundColor: COLORS.red }]}
              />
              <View
                style={[styles.accentSegment, { backgroundColor: COLORS.yellow }]}
              />
              <View
                style={[styles.accentSegment, { backgroundColor: COLORS.blue }]}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Jak chcesz zacząć?</Text>
              <Text style={styles.cardSubtitle}>
                Możesz wejść do gry bez konta albo zalogować się, aby zapisywać
                swój postęp oraz zbierać punkty.
              </Text>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleStartGuest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Zacznij bez konta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButtonFilled}
                onPress={handleGoToLogin}
              >
                <Text style={styles.secondaryButtonFilledText}>Zaloguj się</Text>
              </TouchableOpacity>

              <Text style={styles.smallNote}>
                Konto możesz założyć później – przed utratą postępu przypomnimy
                Ci o tym.
              </Text>
            </View>
          </View>

          {/* Footer path */}
          <View style={styles.footer}>
            <View style={styles.footerPath}>
              <View
                style={[styles.footerNode, { backgroundColor: COLORS.red }]}
              />
              <View style={styles.footerLine} />
              <View
                style={[styles.footerNode, { backgroundColor: COLORS.yellow }]}
              />
              <View style={styles.footerLine} />
              <View
                style={[styles.footerNode, { backgroundColor: COLORS.blue }]}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "space-between",
  },

  // decorative soft blobs (same motive as Login)
  blob: {
    position: "absolute",
    opacity: 0.32,
    borderRadius: 999,
  },
  blobRed: {
    width: 180,
    height: 180,
    backgroundColor: COLORS.red,
    top: -40,
    right: -40,
  },
  blobBlue: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.blue,
    bottom: 40,
    left: -50,
  },
  blobYellow: {
    width: 110,
    height: 110,
    backgroundColor: COLORS.yellow,
    top: 120,
    left: -20,
  },

  header: {
    gap: 14,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.05)",
  },
  badgeTextGhost: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.4,
  },
  badgeColorDots: {
    flexDirection: "row",
    gap: 4,
    marginRight: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  cardOuter: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  accentStrip: {
    flexDirection: "row",
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  accentSegment: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },

  primaryButton: {
    backgroundColor: COLORS.red,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButtonFilled: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonFilledText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: "600",
  },

  smallNote: {
    marginTop: 10,
    fontSize: 11,
    color: COLORS.textMuted,
  },

  footer: {
    marginTop: 16,
    gap: 10,
  },
  footerPath: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerNode: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  footerLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.bgSoft,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

