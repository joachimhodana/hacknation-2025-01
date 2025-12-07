import { StyleSheet, TouchableOpacity, View, Text, ImageBackground } from 'react-native';
import { Route } from '@/data/routes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE_URL } from '@/lib/api-client';

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
}

// Funkcja zwracająca unikalny styl i hook dla każdej ścieżki
function getRouteTheme(routeId: string) {
  switch (routeId) {
    case 'route_001': // Kod/Matematyka - techniczny, cyfrowy
      return {
        accentColors: ['#0d9488', '#14b8a6', '#2dd4bf'], // Teal/Matrix
        cardBgColor: '#0f172a', // Ciemny granat
        cardBgLight: '#1e293b',
        textColor: '#ffffff',
        hook: 'Złam szyfr Enigmy, zanim zrobią to wrodzy agenci!',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', // Enigma/maszyna
      };
    case 'route_002': // Magia/Legendy - tajemniczy, mistyczny
      return {
        accentColors: ['#a855f7', '#c084fc', '#d8b4fe'], // Fiolety
        cardBgColor: '#581c87', // Ciemny fiolet
        cardBgLight: '#6b21a8',
        textColor: '#ffffff',
        hook: 'Odkryj magiczną stronę Bydgoszczy zaklętą w pomnikach.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', // Rzeka o zachodzie
      };
    case 'route_003': // Historia/Wojna - poważny, refleksyjny
      return {
        accentColors: ['#92400e', '#b45309', '#d97706'], // Brązy
        cardBgColor: '#451a03', // Ciemny brąz
        cardBgLight: '#78350f',
        textColor: '#ffffff',
        hook: 'Posłuchaj niemych świadków historii i zapal światło pamięci.',
        imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800', // Pomnik/pamięć
      };
    case 'route_004': // Technika/Przemysł - industrialny
      return {
        accentColors: ['#475569', '#64748b', '#94a3b8'], // Szary, metaliczny
        cardBgColor: '#1e293b', // Ciemny szary
        cardBgLight: '#334155',
        textColor: '#ffffff',
        hook: 'Zostań inżynierem z XIX wieku. Posłuchaj huku maszyn i szumu wody.',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', // Maszyny/przemysł
      };
    case 'route_006': // Muzyka/Sztuka - artystyczny
      return {
        accentColors: ['#dc2626', '#ef4444', '#f87171'], // Czerwony, pasjonujący
        cardBgColor: '#7f1d1d', // Ciemny czerwony
        cardBgLight: '#991b1b',
        textColor: '#ffffff',
        hook: 'Wsłuchaj się w melodię płynącą z pomników i gmachów kultury.',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', // Muzyka/sztuka
      };
    case 'route_007': // Architektura/Secesja - elegancki
      return {
        accentColors: ['#d97706', '#f59e0b', '#fbbf24'], // Złoty, luksusowy
        cardBgColor: '#78350f', // Ciemny złoty
        cardBgLight: '#92400e',
        textColor: '#ffffff',
        hook: 'Podnieś głowę! Posłuchaj opowieści zaklętych w fasadach kamienic.',
        imageUrl: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800', // Architektura
      };
    case 'route_010': // Nostalgia/Lifestyle - ciepły
      return {
        accentColors: ['#ea580c', '#f97316', '#fb923c'], // Pomarańczowy, ciepły
        cardBgColor: '#7c2d12', // Ciemny pomarańcz
        cardBgLight: '#9a3412',
        textColor: '#ffffff',
        hook: 'Poczuj smak dawnej Bydgoszczy w miejscach, których już nie ma.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', // Retro kawiarnia/restauracja
      };
    case 'route_011': // Edukacja/Studencki - dynamiczny
      return {
        accentColors: [COLORS.blue, '#3b82f6', '#60a5fa'], // Niebieski, młody
        cardBgColor: '#1e3a8a', // Ciemny niebieski
        cardBgLight: '#1e40af',
        textColor: '#ffffff',
        hook: 'Szlak Wiecznego Studenta. Odkryj historię nauki i najlepsze miejscówki.',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', // Biblioteka/studenci
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

export function RouteCard({ route, onPress }: RouteCardProps) {
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
        color: '#10b981', // Zielony
        bgColor: '#10b981',
      };
    }
    if (lower.includes('średni')) {
      return {
        label: 'Dla dorosłych (+18)',
        color: '#f59e0b', // Pomarańczowy
        bgColor: '#f59e0b',
      };
    }
    if (lower.includes('trudny')) {
      return {
        label: 'Zaawansowany',
        color: '#ef4444', // Czerwony
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

  // Use thumbnail from API if available, otherwise fall back to theme image
  // Note: thumbnail_url from API should already be a full path like /resources/...
  // We need to prepend the API base URL
  const imageUrl = route.thumbnail_url 
    ? `${API_BASE_URL}${route.thumbnail_url}`
    : theme.imageUrl;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}>
      {/* Hero Image */}
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}>
        {/* Unified dark overlay for better text readability */}
        <View style={styles.darkOverlay} />
        <View style={styles.contentWrapper}>
          {/* Content */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text
                style={[styles.title, { color: '#ffffff' }]}
                numberOfLines={2}>
                {route.title}
              </Text>
            </View>

            {/* Hook - krótki, chwytliwy opis */}
            <Text
              style={[styles.hook, { color: 'rgba(255, 255, 255, 0.95)' }]}
              numberOfLines={2}>
              {theme.hook}
            </Text>

            {/* Info Row */}
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
              {/* Difficulty badge with color */}
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
