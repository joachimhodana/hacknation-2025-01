import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  red: '#ED1C24',
  yellow: '#FFDE00',
  blue: '#0095DA',
};

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const blobRedAnim = useRef(new Animated.Value(0)).current;
  const blobBlueAnim = useRef(new Animated.Value(0)).current;
  const blobYellowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(blobRedAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(blobBlueAnim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(blobYellowAnim, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <Animated.View
          style={[
            styles.blob,
            styles.blobRed,
            {
              opacity: blobRedAnim,
              transform: [
                {
                  scale: blobRedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
            styles.blobBlue,
            {
              opacity: blobBlueAnim,
              transform: [
                {
                  scale: blobBlueAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
            styles.blobYellow,
            {
              opacity: blobYellowAnim,
              transform: [
                {
                  scale: blobYellowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.32,
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
    top: SCREEN_HEIGHT * 0.3,
    left: -20,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

