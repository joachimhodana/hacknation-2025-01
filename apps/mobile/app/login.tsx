// screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      // TODO: Show validation error
      return;
    }

    try {
      setIsLoading(true);
      await authClient.signIn.email({
        email,
        password,
      });
      router.replace("/map");
    } catch (error) {
      console.error("Login error:", error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignup = () => {
    router.push("/signup");
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
          </View>

          {/* Card */}
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
              <Text style={styles.cardTitle}>Zaloguj się</Text>
              <Text style={styles.cardSubtitle}>
                Zapisz postęp, znajdź najciekawszą ścieżkę i kontynuuj grę z dowolnego
                urządzenia.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="bydgoszczanin@mail.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hasło</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Wejdź do miasta</Text>
                )}
              </TouchableOpacity>

              <View style={styles.metaRow}>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Nie pamiętasz hasła?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>albo</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToSignup}>
                <Text style={styles.secondaryButtonText}>
                  Nowy w grze?{" "}
                  <Text style={styles.secondaryButtonHighlight}>
                    Utwórz konto
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Footer hint */}
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
};

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

  // decorative soft blobs
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
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
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
    marginBottom: 10,
  },

  inputGroup: {
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },

  loginButton: {
    marginTop: 16,
    backgroundColor: COLORS.red,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  metaRow: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  linkText: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: "500",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  secondaryButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  secondaryButtonText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  secondaryButtonHighlight: {
    color: COLORS.blue,
    fontWeight: "600",
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
});
