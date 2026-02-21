import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInUp, SlideOutDown } from "react-native-reanimated";

import { useAuth } from "../../../../src/providers/auth-provider";
import { docRef } from "../../../../src/services/firebase/firestore";
import {
  MATCH_SEED_ATTENDEES,
  rankSeedAttendees,
  type MatchResult,
} from "../../../../src/features/networking";
import { useTheme } from "../../../../src/providers/theme-provider";

const { height } = Dimensions.get("window");

export default function MatchesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MatchResult | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMatches = async () => {
      if (!user?.uid) {
        if (isActive) {
          setLoadError("Session expired. Please sign in again.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const snapshot = await docRef<Record<string, unknown>>(`users/${user.uid}`).get();
        const userProfile = (snapshot.data() ?? {}) as Record<string, unknown>;
        const ranked = rankSeedAttendees(userProfile, MATCH_SEED_ATTENDEES);

        if (isActive) {
          setMatches(ranked);
        }
      } catch {
        if (isActive) {
          setLoadError("Couldn't compute matches right now.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadMatches();

    return () => {
      isActive = false;
    };
  }, [user?.uid]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    headerTitle: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 18,
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
    card: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: theme.radius.md,
      marginRight: theme.spacing.md,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    name: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 16,
      flex: 1,
    },
    scoreBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.gray,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
    },
    scoreText: {
      color: theme.colors.primary,
      fontSize: 12,
      marginLeft: theme.spacing.xs,
      fontWeight: "700",
    },
    role: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginBottom: theme.spacing.sm,
    },
    summary: {
      color: theme.colors.textPrimary,
      fontSize: 13,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: `rgba(0, 0, 0, 0.5)`,
      justifyContent: "center",
      padding: theme.spacing.md,
    },
    modalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      maxHeight: height * 0.85,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    heroImage: {
      width: "100%",
      height: 220,
    },
    closeBtn: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 10,
      backgroundColor: theme.colors.textPrimary,
      padding: theme.spacing.sm,
      borderRadius: 999,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalName: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      flex: 1,
    },
    modalScore: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.gray,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: 999,
    },
    roleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.sm,
    },
    modalRole: {
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    modalSummary: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      marginTop: theme.spacing.lg,
      fontWeight: "500",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    breakdownWrap: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    breakdownGrid: {
      gap: theme.spacing.sm,
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    breakdownLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    breakdownValue: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    breakdownTotalRow: {
      marginTop: 4,
      borderColor: theme.colors.primary,
      backgroundColor: "#F0FBF8",
    },
    breakdownTotalLabel: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
    breakdownTotalValue: {
      color: theme.colors.primary,
      fontWeight: "800",
    },
    reasonItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: theme.colors.gray,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.md,
    },
    reasonText: {
      color: theme.colors.textPrimary,
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    cta: {
      backgroundColor: theme.colors.primary,
      marginTop: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    ctaText: {
      fontWeight: "800",
      color: theme.colors.white,
    },
    bottomNav: {
      flexDirection: "row",
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingBottom: 8,
      paddingTop: 10,
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    navText: {
      fontSize: 11,
      fontWeight: "500",
      color: theme.colors.textSecondary,
    },
    navTextActive: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push(`/events/${id}/start-networking`)}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Top Matches</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? <Text style={styles.helperText}>Calculating matches...</Text> : null}
        {!loading && loadError ? <Text style={styles.helperText}>{loadError}</Text> : null}
        {!loading && !loadError && matches.length === 0 ? (
          <Text style={styles.helperText}>No matches found yet.</Text>
        ) : null}

        {!loading && !loadError
          ? matches.map((match, index) => (
              <Animated.View key={match.attendee.id} entering={FadeIn.delay(index * 100)}>
                <Pressable style={styles.card} onPress={() => setSelected(match)}>
                  <Image source={{ uri: match.attendee.image }} style={styles.avatar} />

                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.name}>{match.attendee.linkedIn.name}</Text>

                      <View style={styles.scoreBadge}>
                        <Ionicons name="star" size={12} color={theme.colors.primary} />
                        <Text style={styles.scoreText}>{match.score}%</Text>
                      </View>
                    </View>

                    <Text style={styles.role}>{match.attendee.linkedIn.headline}</Text>
                    <Text style={styles.summary} numberOfLines={2}>
                      {match.summary}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          : null}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="fade">
        {selected && (
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />

            <Animated.View entering={SlideInUp.springify()} exiting={SlideOutDown} style={styles.modalCard}>
              <Pressable style={styles.closeBtn} onPress={() => setSelected(null)}>
                <Ionicons name="close" size={22} color={theme.colors.white} />
              </Pressable>

              <Image source={{ uri: selected.attendee.image }} style={styles.heroImage} />

              <ScrollView
                contentContainerStyle={{
                  padding: theme.spacing.lg,
                  paddingBottom: theme.spacing.xxl,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalName}>{selected.attendee.linkedIn.name}</Text>
                  <View style={styles.modalScore}>
                    <Ionicons name="star" size={14} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>
                      {selected.score}% Match
                    </Text>
                  </View>
                </View>

                <View style={styles.roleRow}>
                  <MaterialIcons name="work" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.modalRole}>{selected.attendee.linkedIn.headline}</Text>
                </View>

                <Text style={styles.modalSummary}>"{selected.summary}"</Text>

                <View style={styles.breakdownWrap}>
                  <View style={styles.sectionHeader}>
                    <Feather name="bar-chart-2" size={16} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>Score Breakdown</Text>
                  </View>

                  <View style={styles.breakdownGrid}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Primary Goal (35%)</Text>
                      <Text style={styles.breakdownValue}>
                        {selected.breakdown.primaryGoal.toFixed(1)} / 35
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Topics (25%)</Text>
                      <Text style={styles.breakdownValue}>
                        {selected.breakdown.topics.toFixed(1)} / 25
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Personality Traits (20%)</Text>
                      <Text style={styles.breakdownValue}>
                        {selected.breakdown.personalityTraits.toFixed(1)} / 20
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Conversation Style (15%)</Text>
                      <Text style={styles.breakdownValue}>
                        {selected.breakdown.conversationStyle.toFixed(1)} / 15
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>LinkedIn Data (5%)</Text>
                      <Text style={styles.breakdownValue}>
                        {selected.breakdown.linkedIn.toFixed(1)} / 5
                      </Text>
                    </View>
                    <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                      <Text style={[styles.breakdownLabel, styles.breakdownTotalLabel]}>Total</Text>
                      <Text style={[styles.breakdownValue, styles.breakdownTotalValue]}>
                        {selected.breakdown.total.toFixed(1)} / 100
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: theme.spacing.lg }}>
                  <View style={styles.sectionHeader}>
                    <Feather name="zap" size={16} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>Why This Match</Text>
                  </View>

                  {selected.reasons.map((reason, i) => (
                    <Animated.View key={i} entering={FadeIn.delay(150 + i * 100)} style={styles.reasonItem}>
                      <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </Animated.View>
                  ))}
                </View>

                <Pressable style={styles.cta} onPress={() => router.push(`/icebreaker/${selected.attendee.id}`)}>
                  <Ionicons name="chatbubble-outline" size={20} color={theme.colors.white} />
                  <Text style={styles.ctaText}>Break the Ice</Text>
                </Pressable>
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/dashboard")}>
          <Ionicons name="home-outline" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="people" size={24} color={theme.colors.primary} />
          <Text style={styles.navTextActive}>Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/profile")}>
          <Ionicons name="person-outline" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
