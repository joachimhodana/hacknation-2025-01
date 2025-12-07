import { StyleSheet, ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { RouteCard } from '@/components/route-card';
import Navbar from '@/components/Navbar';
import { PointsBadge } from '@/components/PointsBadge';
import { authClient } from '@/lib/auth-client';
import { fetchPaths, type Path } from '@/lib/api-client';
import { Route } from '@/data/routes';

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
  const [paths, setPaths] = useState<Route[]>([]);
  const [pathsLoading, setPathsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("[Explore] Component render:", { 
    hasSession: !!session, 
    isPending, 
    pathsLoading,
    pathsCount: paths.length,
    error
  });

  useEffect(() => {
    if (!isPending && !session) {
      console.log("[Explore] No session, redirecting to home");
      router.replace("/");
    }
  }, [session, isPending, router]);

  const loadPaths = useCallback(async () => {
    console.log("[Explore] ===== LOAD PATHS CALLED =====");
    setPathsLoading(true);
    setError(null);
    
    try {
      console.log("[Explore] ===== STARTING LOAD PATHS =====");
      console.log("[Explore] Calling fetchPaths()...");
      const apiPaths = await fetchPaths();
      console.log("[Explore] fetchPaths() returned:", apiPaths);
      console.log("[Explore] Type:", typeof apiPaths);
      console.log("[Explore] Is array:", Array.isArray(apiPaths));
      console.log("[Explore] Length:", apiPaths?.length);
      
      if (apiPaths && Array.isArray(apiPaths) && apiPaths.length > 0) {
        // Transform API paths to Route format
        const routes: Route[] = apiPaths.map((path) => ({
          route_id: path.pathId,
          title: path.title,
          theme: path.theme,
          category: path.category,
          total_time_minutes: path.total_time_minutes,
          difficulty: path.difficulty,
          stops: path.stops,
          thumbnail_url: path.thumbnail_url,
        }));
        console.log("[Explore] Transformed routes:", routes.length);
        setPaths(routes);
      } else {
        console.warn("[Explore] No paths received or empty array");
        setPaths([]);
        setError("Brak dostępnych ścieżek");
      }
    } catch (error) {
      console.error("[Explore] ===== ERROR IN LOAD PATHS =====");
      console.error("[Explore] Error loading paths:", error);
      if (error instanceof Error) {
        console.error("[Explore] Error message:", error.message);
        console.error("[Explore] Error stack:", error.stack);
        setError(`Błąd: ${error.message}`);
      } else {
        setError("Wystąpił błąd podczas ładowania ścieżek");
      }
      setPaths([]);
    } finally {
      setPathsLoading(false);
      console.log("[Explore] ===== FINISHED LOAD PATHS =====");
    }
  }, []);

  // Fetch paths when session is available
  useEffect(() => {
    console.log("[Explore] ===== FETCH EFFECT TRIGGERED =====");
    console.log("[Explore] Session state:", { 
      hasSession: !!session, 
      isPending, 
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (session && !isPending) {
      console.log("[Explore] Conditions met - calling loadPaths()");
      loadPaths();
    } else {
      console.log("[Explore] Conditions NOT met:", {
        hasSession: !!session,
        isPending
      });
    }
  }, [session, isPending, loadPaths]);

  if (isPending || pathsLoading) {
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
      <PointsBadge />
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
          {paths.length === 0 && !pathsLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {error || "Brak dostępnych ścieżek"}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  console.log("[Explore] Manual retry button pressed");
                  loadPaths();
                }}
              >
                <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
              </TouchableOpacity>
            </View>
          ) : paths.length > 0 ? (
            paths.map((route) => (
              <RouteCard
                key={route.route_id}
                route={route}
                onPress={() => handleRoutePress(route.route_id)}
              />
            ))
          ) : null}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
