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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { fetchUserStats, type CollectedItem } from "@/lib/api-client";
import Navbar from "@/components/Navbar";
import { PointsBadge } from "@/components/PointsBadge";
import { authClient } from "@/lib/auth-client";

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
  const { data: session, isPending } = authClient.useSession();
  const [allItems, setAllItems] = useState<CollectedItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  // Modal state - must be declared before any conditional returns
  const [selectedItem, setSelectedItem] = useState<CollectedItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Animation values - must be declared before any conditional returns
  const [backdropOpacity] = useState(new Animated.Value(0));
  const [cardOpacity] = useState(new Animated.Value(0));
  const [cardTranslateY] = useState(new Animated.Value(24));

  // All useEffect hooks must be before conditional returns
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  // Fetch user stats to get collected items
  useEffect(() => {
    if (session && !isPending) {
      loadItems();
    }
  }, [session, isPending]);

  // Drive animations when isOpen changes - MUST be before conditional returns
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

  const loadItems = async () => {
    setItemsLoading(true);
    try {
      const userStats = await fetchUserStats();
      if (userStats) {
        // For now, we only show collected items
        // In the future, we might want to show all available items with collected status
        setAllItems(userStats.collectedItems);
        // Set initial selected item if available
        if (userStats.collectedItems.length > 0) {
          setSelectedItem(userStats.collectedItems[0]);
        }
      }
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  const openModal = (item: CollectedItem) => {
    setSelectedItem(item);
    setIsMounted(true);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  if (isPending || itemsLoading) {
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

  const collectedItems = allItems.filter((i) => i.collected);
  const totalCount = allItems.length; // For now, total = collected (we only show collected items)
  const collectedCount = collectedItems.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background blobs */}
      <View style={[styles.blob, styles.blobRed]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobYellow]} />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Zebrane przedmioty</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.counterRow}>
          <Text style={styles.subtitle}>
            {allItems.length > 0
              ? "Wszystkie przedmioty, które możesz zdobyć w mieście."
              : "Nie masz jeszcze zebranych przedmiotów. Odwiedź miejsca na mapie, aby je zdobyć!"}
          </Text>

          {allItems.length > 0 && (
            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {collectedCount} / {totalCount}
              </Text>
            </View>
          )}
        </View>

        {/* Grid: 3 in a row, includes collected + missing */}
        {allItems.length > 0 ? (
          <View style={styles.itemsGrid}>
            {allItems.map((item) => {
              const isCollected = item.collected;
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
                    !isCollected && styles.itemTileInnerMissing,
                    isCollected && isActive && styles.itemTileInnerActiveCollected,
                  ]}
                >
                  <Text
                    style={[
                      styles.itemTileEmoji,
                      !isCollected && styles.itemTileEmojiMissing,
                    ]}
                  >
                    {item.emoji}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* phantom tiles to align grid */}
          {allItems.length % 3 !== 0 &&
            Array.from({ length: 3 - (allItems.length % 3) }).map((_, idx) => (
              <View key={`phantom-${idx}`} style={styles.itemTilePhantom} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📦</Text>
            <Text style={styles.emptyStateText}>
              Zacznij odkrywać miasto, aby zbierać przedmioty!
            </Text>
          </View>
        )}

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
                        <Text style={styles.modalTitle}>
                          {selectedItem.title}
                        </Text>
                        <Text style={styles.modalPlace}>
                          {selectedItem.placeName ?? "Miejsce do uzupełnienia"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.modalDescription}>
                      {selectedItem.description}
                    </Text>

                    <View style={styles.modalMetaRow}>
                      <View>
                        <Text style={styles.modalMetaLabel}>Status:</Text>
                        <Text style={styles.modalMetaValue}>
                          {selectedItem.collected
                            ? "Zebrano"
                            : "Jeszcze nie zebrano"}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.modalMetaLabel}>Data zebrania:</Text>
                        <Text style={styles.modalMetaValue}>
                          {selectedItem.collectedAt && selectedItem.collected
                            ? selectedItem.collectedAt
                            : "—"}
                        </Text>
                      </View>
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
      <Navbar />
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
    paddingBottom: 100, // Extra padding for absolute navbar
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

  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  subtitle: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  counterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.softBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: "600",
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
  itemTileInnerMissing: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E5E7EB",
    opacity: 0.55,
  },
  itemTileInnerActiveCollected: {
    borderColor: COLORS.red,
    backgroundColor: "#FEE2E2",
  },
  itemTileEmoji: {
    fontSize: 30,
    color: COLORS.textDark,
  },
  itemTileEmojiMissing: {
    color: "#9CA3AF",
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
    alignItems: "flex-start",
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
    marginTop: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
