import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  textDark: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  bgSoft: "#F3F4F6",
};

const slides = [
  {
    title: "Lorem ipsum dolor",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer volutpat lorem vel est.",
  },
  {
    title: "Dolor sit amet",
    text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Explore your city",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris viverra euismod.",
  },
];

export default function OnboardingScreen() {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const newPage = Math.round(contentOffset.x / layoutMeasurement.width);
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  const handleNext = () => {
    if (page < slides.length - 1) {
      const nextPage = page + 1;
      scrollRef.current?.scrollTo({
        x: width * nextPage,
        animated: true,
      });
      // Remove setPage here - let handleScroll update it
    } else {
      // TODO: navigate to start / login
      console.log("Finish onboarding → Start");
    }
  };

  const handleSkip = () => {
    // TODO: navigate to start / login
    console.log("Skip onboarding");
  };

  const isLast = page === slides.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative bubbles */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, index) => (
            <View style={styles.slide} key={index}>
              {/* Big rectangle image area */}
              <View style={styles.imageContainer}>
                {/* Replace this with your <Image /> later */}
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>IMAGE</Text>
                </View>
              </View>

              {/* Text a bit lower / centered overall */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  page === i && { backgroundColor: COLORS.red, width: 22 },
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonsColumn}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {isLast ? "Start" : "Next"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const IMAGE_HEIGHT = height * 0.55; // big rectangle, ~85% of content above footer

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  // bubbles
  blob: {
    position: "absolute",
    opacity: 0.25,
    borderRadius: 999,
  },
  blobRed: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.red,
    top: -50,
    right: -70,
  },
  blobBlue: {
    width: 170,
    height: 170,
    backgroundColor: COLORS.blue,
    bottom: 40,
    left: -50,
  },
  blobYellow: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.yellow,
    top: 130,
    left: -30,
  },

  slide: {
    width,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  imageContainer: {
    width: "100%",
    height: IMAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  textContainer: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textDark,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 14,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 10,
  },

  buttonsColumn: {
    marginTop: 8,
    alignItems: "center",
    gap: 8,
  },
  nextButton: {
    width: "100%",
    backgroundColor: COLORS.red,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  skip: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
