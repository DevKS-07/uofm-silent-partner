import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";

import { useTheme } from "../../../../src/providers/theme-provider";

const { height } = Dimensions.get("window");

const matches = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Product Manager at Google",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    score: 98,
    summary: "Perfect match for your SaaS scaling questions.",
    reasons: [
      "Both interested in AI-driven Growth",
      "She's looking for technical co-founders",
      "Shared background in FinTech",
      "Attended the same 'Future of Tech' talk",
    ],
  },
  {
    id: 2,
    name: "David Miller",
    role: "VC Partner at Sequoia",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    score: 94,
    summary: "Active investor in your sector.",
    reasons: [
      "Currently funding Seed stage AI startups",
      "Expert in B2B Marketplaces",
      "Your profile matches his investment thesis",
    ],
  },
];

export default function MatchesScreen({ id }: { id: string }) {
  const router = useRouter();
  const theme = useTheme();
  const [selected, setSelected] = useState<(typeof matches)[0] | null>(null);

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
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push(`/events/${id}/start-networking`)}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.colors.textSecondary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Top Matches</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {matches.map((match, index) => (
          <Animated.View key={match.id} entering={FadeIn.delay(index * 100)}>
            <Pressable style={styles.card} onPress={() => setSelected(match)}>
              <Image source={{ uri: match.image }} style={styles.avatar} />

              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{match.name}</Text>

                  <View style={styles.scoreBadge}>
                    <Ionicons
                      name="star"
                      size={12}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.scoreText}>{match.score}%</Text>
                  </View>
                </View>

                <Text style={styles.role}>{match.role}</Text>
                <Text style={styles.summary} numberOfLines={2}>
                  {match.summary}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Modal */}
      <Modal visible={!!selected} transparent animationType="fade">
        {selected && (
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setSelected(null)}
            />

            <Animated.View
              entering={SlideInUp.springify()}
              exiting={SlideOutDown}
              style={styles.modalCard}
            >
              {/* Close */}
              <Pressable
                style={styles.closeBtn}
                onPress={() => setSelected(null)}
              >
                <Ionicons name="close" size={22} color={theme.colors.white} />
              </Pressable>

              {/* Hero Image */}
              <Image
                source={{ uri: selected.image }}
                style={styles.heroImage}
              />

              <ScrollView style={{ padding: theme.spacing.lg }}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalName}>{selected.name}</Text>
                  <View style={styles.modalScore}>
                    <Ionicons
                      name="star"
                      size={14}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontWeight: "700",
                      }}
                    >
                      {selected.score}% Match
                    </Text>
                  </View>
                </View>

                <View style={styles.roleRow}>
                  <MaterialIcons
                    name="work"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.modalRole}>{selected.role}</Text>
                </View>

                <Text style={styles.modalSummary}>"{selected.summary}"</Text>

                <View style={{ marginTop: theme.spacing.lg }}>
                  <View style={styles.sectionHeader}>
                    <Feather
                      name="zap"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.sectionTitle}>Why This Match</Text>
                  </View>

                  {selected.reasons.map((reason, i) => (
                    <Animated.View
                      key={i}
                      entering={FadeIn.delay(150 + i * 100)}
                      style={styles.reasonItem}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={theme.colors.success}
                      />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </Animated.View>
                  ))}
                </View>

                <Pressable
                  style={styles.cta}
                  onPress={() => router.push(`/icebreaker/${selected.id}`)}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={theme.colors.white}
                  />
                  <Text style={styles.ctaText}>Break the Ice ❄️</Text>
                </Pressable>
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </Modal>
    </View>
  );
}
