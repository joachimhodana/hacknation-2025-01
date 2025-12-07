import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { RouteCard } from '@/components/route-card';
import { routes } from '@/data/routes';
import Navbar from '@/components/Navbar';
import { PointsBadge } from '@/components/PointsBadge';
import { authClient } from '@/lib/auth-client';

const COLORS = {
  red: '#ED1C24',
  yellow: '#FFDE00',
  blue: '#0095DA',
  textDark: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  bgSoft: '#F3F4F6',
};

export default function ExploreScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
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

  const handleRoutePress = (routeId: string) => {
    router.push(`/route-details?routeId=${routeId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative background blobs - jak w start.tsx */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badgePill,
                { backgroundColor: 'rgba(237, 28, 36, 0.08)', borderWidth: 0 },
              ]}>
              <View style={styles.badgeColorDots}>
                <View
                  style={[styles.badgeDot, { backgroundColor: COLORS.red }]}
                />
                <View
                  style={[styles.badgeDot, { backgroundColor: COLORS.yellow }]}
                />
                <View
                  style={[styles.badgeDot, { backgroundColor: COLORS.blue }]}
                />
              </View>
              <Text style={styles.badgeTextGhost}>
                Odkryj Bydgoszcz na nowo
              </Text>
            </View>
          </View>

          <Text style={styles.title}>Wybierz Ścieżkę</Text>
          <Text style={styles.subtitle}>
            Każda trasa to inna opowieść. Wybierz temat, który Cię
            interesuje i rozpocznij podróż.
          </Text>
        </View>

        {/* Routes List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {[...routes].reverse().map((route) => (
            <RouteCard
              key={route.route_id}
              route={route}
              onPress={() => handleRoutePress(route.route_id)}
            />
          ))}
        </ScrollView>

        {/* Footer path - jak w start.tsx */}
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
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  // Decorative blobs
  blob: {
    position: 'absolute',
    opacity: 0.28,
    borderRadius: 999,
  },
  blobRed: {
    width: 160,
    height: 160,
    backgroundColor: COLORS.red,
    top: -30,
    right: -30,
  },
  blobBlue: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.blue,
    bottom: 100,
    left: -40,
  },
  blobYellow: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.yellow,
    top: 200,
    left: -15,
  },
  header: {
    gap: 14,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.05)',
  },
  badgeTextGhost: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  badgeColorDots: {
    flexDirection: 'row',
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
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for absolute navbar
  },
  footer: {
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  footerPath: {
    flexDirection: 'row',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
