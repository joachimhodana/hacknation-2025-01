import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen 
          name="splash" 
          options={{
            gestureEnabled: false,
            animationEnabled: false,
          }}
        />
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen 
          name="map" 
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="explore" 
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="profile" 
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="collections" 
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="route-details" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
