import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { routes } from '@/data/routes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchPaths, getActivePathProgress, startPath, pausePath, type Path } from '@/lib/api-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  red: '#ED1C24',
  textDark: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  bgSoft: '#F3F4F6',
};

function getRouteImage(routeId: string): string {
  const imageMap: Record<string, string> = {
    route_001: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    route_002: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    route_003: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
    route_004: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    route_006: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    route_007: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800',
    route_010: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    route_011: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  };
  return imageMap[routeId] || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800';
}

function getRouteBackgroundTheme(routeId: string) {
  switch (routeId) {
    case 'route_001': // Kod/Matematyka - techniczny, cyfrowy
      return {
        backgroundColor: '#0f172a', // Ciemny granat
        accentColor: '#0d9488', // Teal
        textColor: '#ffffff',
        cardBg: '#1e293b',
      };
    case 'route_002': // Magia/Legendy - tajemniczy, mistyczny
      return {
        backgroundColor: '#581c87', // Ciemny fiolet
        accentColor: '#a855f7', // Fiolet
        textColor: '#ffffff',
        cardBg: '#6b21a8',
      };
    case 'route_003': // Historia/Wojna - poważny, refleksyjny
      return {
        backgroundColor: '#451a03', // Ciemny brąz
        accentColor: '#92400e', // Brąz
        textColor: '#ffffff',
        cardBg: '#78350f',
      };
    case 'route_004': // Technika/Przemysł - industrialny
      return {
        backgroundColor: '#1e293b', // Ciemny szary
        accentColor: '#475569', // Szary
        textColor: '#ffffff',
        cardBg: '#334155',
      };
    case 'route_006': // Muzyka/Sztuka - artystyczny
      return {
        backgroundColor: '#7f1d1d', // Ciemny czerwony
        accentColor: '#dc2626', // Czerwony
        textColor: '#ffffff',
        cardBg: '#991b1b',
      };
    case 'route_007': // Architektura/Secesja - elegancki
      return {
        backgroundColor: '#78350f', // Ciemny złoty
        accentColor: '#d97706', // Złoty
        textColor: '#ffffff',
        cardBg: '#92400e',
      };
    case 'route_010': // Nostalgia/Lifestyle - ciepły
      return {
        backgroundColor: '#7c2d12', // Ciemny pomarańcz
        accentColor: '#ea580c', // Pomarańczowy
        textColor: '#ffffff',
        cardBg: '#9a3412',
      };
    case 'route_011': // Edukacja/Studencki - dynamiczny
      return {
        backgroundColor: '#1e3a8a', // Ciemny niebieski
        accentColor: '#0095DA', // Niebieski
        textColor: '#ffffff',
        cardBg: '#1e40af',
      };
    default:
      return {
        backgroundColor: '#1a1a1a',
        accentColor: '#ED1C24',
        textColor: '#ffffff',
        cardBg: '#2a2a2a',
      };
  }
}

export default function RouteDetailsScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [route, setRoute] = useState<Path | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch route data and active path
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to fetch from API first
        const paths = await fetchPaths();
        if (paths) {
          const apiRoute = paths.find((p) => p.pathId === routeId);
          if (apiRoute) {
            setRoute({
              ...apiRoute,
              route_id: apiRoute.pathId,
            } as any);
          }
        }
        
        // Fallback to static data if API doesn't have it
        if (!route) {
          const staticRoute = routes.find((r) => r.route_id === routeId);
          if (staticRoute) {
            setRoute(staticRoute as any);
          }
        }

        // Fetch active path
        const progress = await getActivePathProgress();
        if (progress) {
          setActivePathId(progress.path.pathId);
        } else {
          setActivePathId(null);
        }
      } catch (error) {
        console.error("[RouteDetails] Error loading data:", error);
        // Fallback to static data
        const staticRoute = routes.find((r) => r.route_id === routeId);
        if (staticRoute) {
          setRoute(staticRoute as any);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [routeId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#1a1a1a' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED1C24" />
        </View>
      </SafeAreaView>
    );
  }

  if (!route) {
    router.back();
    return null;
  }

  const isActive = activePathId === routeId;
  const hasOtherActivePath = activePathId !== null && !isActive;

  const imageUrl = getRouteImage(route.route_id);
  const backgroundTheme = getRouteBackgroundTheme(route.route_id);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getDifficultyInfo = (difficulty: string) => {
    const lower = difficulty.toLowerCase();
    if (lower.includes('łatwy')) {
      return {
        label: 'Dla rodzin z dziećmi',
        color: '#10b981',
        bgColor: '#10b981',
      };
    }
    if (lower.includes('średni')) {
      return {
        label: 'Dla dorosłych (+18)',
        color: '#f59e0b',
        bgColor: '#f59e0b',
      };
    }
    if (lower.includes('trudny')) {
      return {
        label: 'Zaawansowany',
        color: '#ef4444',
        bgColor: '#ef4444',
      };
    }
    return {
      label: difficulty,
      color: COLORS.textMuted,
      bgColor: COLORS.bgSoft,
    };
  };

  const difficultyInfo = getDifficultyInfo(route.difficulty);

  const handleStartPath = async () => {
    if (hasOtherActivePath) {
      Alert.alert(
        "Inna ścieżka aktywna",
        "Masz już aktywną ścieżkę. Zatrzymaj ją, aby rozpocząć nową.",
        [{ text: "OK" }]
      );
      return;
    }

    setActionLoading(true);
    try {
      const result = await startPath(routeId);
      if (result.success) {
        setActivePathId(routeId);
        router.push(`/map?routeId=${routeId}`);
      } else {
        Alert.alert("Błąd", result.error || "Nie udało się rozpocząć ścieżki");
      }
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił błąd podczas rozpoczynania ścieżki");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePausePath = async () => {
    setActionLoading(true);
    try {
      const result = await pausePath(routeId);
      if (result.success) {
        setActivePathId(null);
        Alert.alert("Ścieżka zatrzymana", "Ścieżka została zatrzymana. Możesz teraz rozpocząć inną.");
      } else {
        Alert.alert("Błąd", result.error || "Nie udało się zatrzymać ścieżki");
      }
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił błąd podczas zatrzymywania ścieżki");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: backgroundTheme.backgroundColor },
      ]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
          onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={backgroundTheme.textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.mainInfo}>
          <Text
            style={[
              styles.routeTitle,
              { color: backgroundTheme.textColor },
            ]}>
            {route.title}
          </Text>

          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <MaterialIcons
                name="schedule"
                size={16}
                color={backgroundTheme.textColor}
              />
              <Text
                style={[
                  styles.tagText,
                  { color: backgroundTheme.textColor },
                ]}>
                {formatTime(route.total_time_minutes)}
              </Text>
            </View>
            <View
              style={[
                styles.tag,
                { backgroundColor: difficultyInfo.bgColor + '40' },
              ]}>
              <Text
                style={[styles.tagText, { color: difficultyInfo.color }]}>
                {difficultyInfo.label}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <MaterialIcons name="place" size={16} color={backgroundTheme.textColor} />
              <Text
                style={[
                  styles.tagText,
                  { color: backgroundTheme.textColor },
                ]}>
                {route.stops.length} przystanków
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text
            style={[
              styles.descriptionTitle,
              { color: backgroundTheme.textColor },
            ]}>
            O ścieżce
          </Text>
          <Text
            style={[
              styles.description,
              { color: backgroundTheme.textColor + 'CC' },
            ]}>
            {route.theme}
          </Text>
        </View>

        <View style={styles.stopsSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: backgroundTheme.textColor },
            ]}>
            Przystanki ({route.stops.length})
          </Text>
          {route.stops.slice(0, 3).map((stop) => (
            <View
              key={stop.stop_id}
              style={[
                styles.stopCard,
                {
                  backgroundColor: backgroundTheme.cardBg,
                  borderColor: backgroundTheme.accentColor + '40',
                },
              ]}>
              <View style={[styles.stopNumber, { backgroundColor: backgroundTheme.accentColor }]}>
                <Text style={styles.stopNumberText}>{stop.stop_id}</Text>
              </View>
              <View style={styles.stopContent}>
                <Text
                  style={[
                    styles.stopName,
                    { color: backgroundTheme.textColor },
                  ]}>
                  {stop.name}
                </Text>
                <Text
                  style={[
                    styles.stopAddress,
                    { color: backgroundTheme.textColor + 'AA' },
                  ]}
                  numberOfLines={1}>
                  {stop.map_marker.address}
                </Text>
              </View>
            </View>
          ))}
          {route.stops.length > 3 && (
            <Text
              style={[
                styles.moreStops,
                { color: backgroundTheme.textColor + 'AA' },
              ]}>
              +{route.stops.length - 3} więcej przystanków
            </Text>
          )}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: backgroundTheme.cardBg,
            borderTopColor: backgroundTheme.accentColor + '40',
          },
        ]}>
        {hasOtherActivePath ? (
          <View style={[styles.disabledButton, { backgroundColor: backgroundTheme.cardBg, borderColor: backgroundTheme.accentColor + '40' }]}>
            <Text style={[styles.disabledButtonText, { color: backgroundTheme.textColor + 'AA' }]}>
              Zatrzymaj aktywną ścieżkę, aby rozpocząć tę
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: isActive ? '#ef4444' : backgroundTheme.accentColor },
            ]}
            onPress={isActive ? handlePausePath : handleStartPath}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.startButtonText}>
                  {isActive ? "Zatrzymaj podróż" : "Rozpocznij ścieżkę"}
                </Text>
                <MaterialIcons
                  name={isActive ? "pause" : "arrow-forward"}
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  mainInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  routeTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  stopsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  stopNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stopContent: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stopAddress: {
    fontSize: 13,
  },
  moreStops: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  footerSpacer: {
    height: 20,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

