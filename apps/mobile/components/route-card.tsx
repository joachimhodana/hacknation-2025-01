import { StyleSheet, TouchableOpacity, View, Text, ImageBackground } from 'react-native';
import { Route } from '@/data/routes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAPIBaseURL } from '@/lib/api-url';

const COLORS = {
  red: '#ED1C24',
  yellow: '#FFDE00',
  blue: '#0095DA',
  textDark: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  bgSoft: '#F3F4F6',
};

interface RouteCardProps {
  route: Route;
  onPress?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

function getRouteTheme(routeId: string) {
  switch (routeId) {
    case 'route_001':
      return {
        accentColors: ['#0d9488', '#14b8a6', '#2dd4bf'],
        cardBgColor: '#0f172a',
        cardBgLight: '#1e293b',
        textColor: '#ffffff',
        hook: 'Złam szyfr Enigmy, zanim zrobią to wrodzy agenci!',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      };
    case 'route_002':
      return {
        accentColors: ['#a855f7', '#c084fc', '#d8b4fe'],
        cardBgColor: '#581c87',
        cardBgLight: '#6b21a8',
        textColor: '#ffffff',
        hook: 'Odkryj magiczną stronę Bydgoszczy zaklętą w pomnikach.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      };
    case 'route_003':
      return {
        accentColors: ['#92400e', '#b45309', '#d97706'],
        cardBgColor: '#451a03',
        cardBgLight: '#78350f',
        textColor: '#ffffff',
        hook: 'Posłuchaj niemych świadków historii i zapal światło pamięci.',
        imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
      };
    case 'route_004':
      return {
        accentColors: ['#475569', '#64748b', '#94a3b8'],
        cardBgColor: '#1e293b',
        cardBgLight: '#334155',
        textColor: '#ffffff',
        hook: 'Zostań inżynierem z XIX wieku. Posłuchaj huku maszyn i szumu wody.',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
      };
    case 'route_006':
      return {
        accentColors: ['#dc2626', '#ef4444', '#f87171'],
        cardBgColor: '#7f1d1d',
        cardBgLight: '#991b1b',
        textColor: '#ffffff',
        hook: 'Wsłuchaj się w melodię płynącą z pomników i gmachów kultury.',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      };
    case 'route_007':
      return {
        accentColors: ['#d97706', '#f59e0b', '#fbbf24'],
        cardBgColor: '#78350f',
        cardBgLight: '#92400e',
        textColor: '#ffffff',
        hook: 'Podnieś głowę! Posłuchaj opowieści zaklętych w fasadach kamienic.',
        imageUrl: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800',
      };
    case 'route_010':
      return {
        accentColors: ['#ea580c', '#f97316', '#fb923c'],
        cardBgColor: '#7c2d12',
        cardBgLight: '#9a3412',
        textColor: '#ffffff',
        hook: 'Poczuj smak dawnej Bydgoszczy w miejscach, których już nie ma.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      };
    case 'route_011':
      return {
        accentColors: [COLORS.blue, '#3b82f6', '#60a5fa'],
        cardBgColor: '#1e3a8a',
        cardBgLight: '#1e40af',
        textColor: '#ffffff',
        hook: 'Szlak Wiecznego Studenta. Odkryj historię nauki i najlepsze miejscówki.',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
      };
    default:
      return {
        accentColors: [COLORS.red, COLORS.yellow, COLORS.blue],
        cardBgColor: '#1a1a1a',
        cardBgLight: '#2a2a2a',
        textColor: '#ffffff',
        hook: routeId,
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
      };
  }
}

export function RouteCard({ route, onPress, isActive = false, isDisabled = false }: RouteCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getRouteTheme(route.route_id);

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
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.3)',
    };
  };

  const difficultyInfo = getDifficultyInfo(route.difficulty);

  const imageUrl = route.thumbnail_url 
    ? `${getAPIBaseURL()}${route.thumbnail_url}`
    : theme.imageUrl;

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.9}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.container,
        isDisabled && styles.containerDisabled,
        isActive && styles.containerActive,
      ]}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}>
        <View style={styles.darkOverlay} />
        <View style={styles.contentWrapper}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text
                style={[styles.title, { color: '#ffffff' }]}
                numberOfLines={2}>
                {route.title}
              </Text>
            </View>

            <Text
              style={[styles.hook, { color: 'rgba(255, 255, 255, 0.95)' }]}
              numberOfLines={2}>
              {theme.hook}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoText}>
                  {formatTime(route.total_time_minutes)}
                </Text>
                <Text style={styles.infoSeparator}>•</Text>
                <Text style={styles.infoText}>
                  {route.stops.length} miejsc
                </Text>
              </View>
              <View style={styles.infoRight}>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>W trakcie</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: difficultyInfo.bgColor },
                  ]}>
                  <Text style={styles.difficultyText}>
                    {difficultyInfo.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  containerActive: {
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  heroImage: {
    width: '100%',
    minHeight: 280,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderRadius: 20,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hook: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoSeparator: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
