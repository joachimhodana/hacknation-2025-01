import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the native splash screen visible while we load the app
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide the native splash screen immediately so our custom splash shows
    SplashScreen.hideAsync().catch(() => {
      // Ignore errors if splash screen is already hidden
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="map" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="collections" />
        <Stack.Screen name="route-details" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
