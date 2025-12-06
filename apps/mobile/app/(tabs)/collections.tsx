import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { items as allItems, type CollectedItem } from "./profile";

const COLORS = {
  red: "#ED1C24",
  yellow: "#FFDE00",
  blue: "#0095DA",
  textDark: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  cardBg: "#FFFFFF",
  softBg: "#F3F4F6",
};

const CollectionsScreen: React.FC = () => {
  const router = useRouter();

  const collectedItems = allItems.filter((i) => i.collected);
  const [selectedItem, setSelectedItem] = useState<CollectedItem | null>(
    collectedItems[0] ?? null,
  );

  // logical "open/close"
  const [isOpen, setIsOpen] = useState(false);
  // actual Modal mount flag (so we can animate out before unmount)
  const [isMounted, setIsMounted] = useState(false);

  // animation values
  const [backdropOpacity] = useState(new Animated.Value(0));
  const [cardOpacity] = useState(new Animated.Value(0));
  const [cardTranslateY] = useState(new Animated.Value(24));

  const openModal = (item: CollectedItem) => {
    setSelectedItem(item);
    setIsMounted(true);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // drive animations when isOpen changes
  useEffect(() => {
    if (!isMounted) return;

    if (isOpen) {
      // animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // animate out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 24,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsMounted(false);
        }
      });
    }
  }, [isOpen, isMounted, backdropOpacity, cardOpacity, cardTranslateY]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background blobs */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Wróć</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zebrane przedmioty</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Wszystkie przedmioty, które zebrałeś w mieście. Kliknij na przedmiot,
          żeby zobaczyć, gdzie i kiedy go zdobyłeś.
        </Text>

        {/* Grid: 3 in a row */}
        <View style={styles.itemsGrid}>
          {collectedItems.map((item) => {
            const isActive = selectedItem?.id === item.id && isOpen;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.itemTile}
                onPress={() => openModal(item)}
              >
                <View
                  style={[
                    styles.itemTileInner,
                    isActive && styles.itemTileInnerActive,
                  ]}
                >
                  <Text style={styles.itemTileEmoji}>{item.emoji}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* phantom tiles to align grid */}
          {collectedItems.length % 3 !== 0 &&
            Array.from({ length: 3 - (collectedItems.length % 3) }).map(
              (_, idx) => (
                <View key={`phantom-${idx}`} style={styles.itemTilePhantom} />
              ),
            )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Animated modal */}
      <Modal
        visible={isMounted}
        animationType="none"
        transparent
        onRequestClose={closeModal}
      >
        <Animated.View
          style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
        >
          <Pressable style={styles.modalTouchCatch} onPress={closeModal}>
            <Animated.View
              style={[
                styles.modalCard,
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}
            >
              {selectedItem && (
                <>
                  {/* Accent strip */}
                  <View style={styles.modalAccentStrip}>
                    <View
                      style={[
                        styles.modalAccentSegment,
                        { backgroundColor: COLORS.red },
                      ]}
                    />
                    <View
                      style={[
                        styles.modalAccentSegment,
                        { backgroundColor: COLORS.yellow },
                      ]}
                    />
                    <View
                      style={[
                        styles.modalAccentSegment,
                        { backgroundColor: COLORS.blue },
                      ]}
                    />
                  </View>

                  <View style={styles.modalContent}>
                    <View style={styles.modalHeaderRow}>
                      <View style={styles.modalEmojiWrapper}>
                        <Text style={styles.modalEmoji}>{selectedItem.emoji}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                        <Text style={styles.modalPlace}>
                          {selectedItem.placeName ?? "Miejsce do uzupełnienia"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.modalDescription}>
                      {selectedItem.description}
                    </Text>

                    <View style={styles.modalMetaRow}>
                      <Text style={styles.modalMetaLabel}>Data zebrania:</Text>
                      <Text style={styles.modalMetaValue}>
                        {selectedItem.collectedAt ?? "Do uzupełnienia"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={closeModal}
                    >
                      <Text style={styles.modalCloseText}>Zamknij</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default CollectionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // blobs
  blob: {
    position: "absolute",
    opacity: 0.28,
    borderRadius: 999,
  },
  blobRed: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.red,
    top: -50,
    right: -80,
  },
  blobBlue: {
    width: 180,
    height: 180,
    backgroundColor: COLORS.blue,
    top: 140,
    left: -60,
  },
  blobYellow: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.yellow,
    bottom: 60,
    right: -40,
  },

  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
  },

  // Grid: 3 in a row
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  itemTile: {
    width: "30%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTilePhantom: {
    width: "30%",
    aspectRatio: 1,
  },
  itemTileInner: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: COLORS.softBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTileInnerActive: {
    borderColor: COLORS.red,
    backgroundColor: "#FEE2E2",
  },
  itemTileEmoji: {
    fontSize: 30,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalTouchCatch: {
    width: "100%",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.cardBg,
  },
  modalAccentStrip: {
    flexDirection: "row",
    height: 4,
    overflow: "hidden",
  },
  modalAccentSegment: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  modalEmojiWrapper: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.softBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalEmoji: {
    fontSize: 30,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  modalPlace: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 12,
  },
  modalMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalMetaLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalMetaValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.red,
  },
  modalCloseText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
