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

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      await authClient.signUp.email({
        email,
        password,
        name,
      });
      router.replace("/map");
    } catch (error) {
      console.error("Signup error:", error);
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
              <Text style={styles.cardTitle}>Utwórz konto</Text>
              <Text style={styles.cardSubtitle}>
                Załóż konto, aby zapisywać swój postęp i kontynuować grę z dowolnego
                urządzenia.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Imię</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jan"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              </View>

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
                style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signupButtonText}>Utwórz konto</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>albo</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToLogin}>
                <Text style={styles.secondaryButtonText}>
                  Masz już konto?{" "}
                  <Text style={styles.secondaryButtonHighlight}>
                    Zaloguj się
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

  signupButton: {
    marginTop: 16,
    backgroundColor: COLORS.red,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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
});

