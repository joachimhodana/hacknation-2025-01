import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { routes } from '@/data/routes';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

export default function RouteDetailsScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const route = routes.find((r) => r.route_id === routeId);
  
  if (!route) {
    router.back();
    return null;
  }

  const imageUrl = getRouteImage(route.route_id);

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

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#151718' : '#FEFEFE' },
      ]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textDark} />
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
              { color: isDark ? '#ECEDEE' : COLORS.textDark },
            ]}>
            {route.title}
          </Text>

          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: COLORS.bgSoft }]}>
              <MaterialIcons
                name="schedule"
                size={16}
                color={COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tagText,
                  { color: isDark ? '#9BA1A6' : COLORS.textMuted },
                ]}>
                {formatTime(route.total_time_minutes)}
              </Text>
            </View>
            <View
              style={[
                styles.tag,
                { backgroundColor: difficultyInfo.bgColor + '20' },
              ]}>
              <Text
                style={[styles.tagText, { color: difficultyInfo.color }]}>
                {difficultyInfo.label}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: COLORS.bgSoft }]}>
              <MaterialIcons name="place" size={16} color={COLORS.textMuted} />
              <Text
                style={[
                  styles.tagText,
                  { color: isDark ? '#9BA1A6' : COLORS.textMuted },
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
              { color: isDark ? '#ECEDEE' : COLORS.textDark },
            ]}>
            O ścieżce
          </Text>
          <Text
            style={[
              styles.description,
              { color: isDark ? '#9BA1A6' : COLORS.textMuted },
            ]}>
            {route.theme}
          </Text>
        </View>

        <View style={styles.stopsSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#ECEDEE' : COLORS.textDark },
            ]}>
            Przystanki ({route.stops.length})
          </Text>
          {route.stops.slice(0, 3).map((stop) => (
            <View
              key={stop.stop_id}
              style={[
                styles.stopCard,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
                  borderColor: isDark ? '#2a2a2a' : COLORS.border,
                },
              ]}>
              <View style={styles.stopNumber}>
                <Text style={styles.stopNumberText}>{stop.stop_id}</Text>
              </View>
              <View style={styles.stopContent}>
                <Text
                  style={[
                    styles.stopName,
                    { color: isDark ? '#ECEDEE' : COLORS.textDark },
                  ]}>
                  {stop.name}
                </Text>
                <Text
                  style={[
                    styles.stopAddress,
                    { color: isDark ? '#9BA1A6' : COLORS.textMuted },
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
                { color: isDark ? '#9BA1A6' : COLORS.textMuted },
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
            backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
            borderTopColor: isDark ? '#2a2a2a' : COLORS.border,
          },
        ]}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: COLORS.red }]}
          onPress={() => router.push(`/map?routeId=${route.route_id}`)}>
          <Text style={styles.startButtonText}>Rozpocznij ścieżkę</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
});

