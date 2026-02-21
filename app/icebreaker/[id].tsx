import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../src/providers/theme-provider";
import { useAuth } from "../../src/providers/auth-provider";
import { MATCH_SEED_ATTENDEES } from "../../src/features/networking";
import { generateIcebreakerPack } from "../../src/services/ai";
import { docRef } from "../../src/services/firebase/firestore";

type SuggestionType = "primary" | "followup" | "fallback";

type Suggestion = {
  type: SuggestionType;
  label: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type RescueLine = {
  title: string;
  text: string;
};

type IcebreakerData = {
  name: string;
  role: string;
  suggestions: Suggestion[];
  rescueLines: RescueLine[];
};

const DEFAULT_DATA: IcebreakerData = {
  name: "New Connection",
  role: "Tech Professional",
  suggestions: [
    {
      type: "primary",
      label: "Primary Opening Line",
      text: "What are you most excited to explore at this event today?",
      icon: "flash-outline",
    },
    {
      type: "followup",
      label: "Follow-Up Line",
      text: "What kind of people are you hoping to meet here?",
      icon: "chatbubble-outline",
    },
    {
      type: "fallback",
      label: "Safe Fallback Line",
      text: "Great to meet you. Which session has been your favorite so far?",
      icon: "shield-checkmark-outline",
    },
  ],
  rescueLines: [
    {
      title: "Soft Pivot",
      text: "By the way, have you discovered any interesting talks yet?",
    },
    {
      title: "Curiosity Pivot",
      text: "What trend in your space are you watching most closely this year?",
    },
    {
      title: "Social Pivot",
      text: "Are you joining any networking sessions later today?",
    },
  ],
};

const COACH_MESSAGES = [
  "Nice. That sounded natural and confident.",
  "Good momentum. Keep the exchange curious.",
  "Strong opener. Follow with one specific question.",
];

export default function IcebreakerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [coachMessage, setCoachMessage] = useState("");
  const [showCoach, setShowCoach] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<IcebreakerData>(DEFAULT_DATA);

  const coachOpacity = useRef(new Animated.Value(0)).current;
  const coachTranslate = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!id || !user?.uid) {
        if (isActive) {
          setData(DEFAULT_DATA);
          setIsLoading(false);
        }
        return;
      }

      const attendee = MATCH_SEED_ATTENDEES.find((item) => item.id === id);
      if (!attendee) {
        if (isActive) {
          setData(DEFAULT_DATA);
          setIsLoading(false);
        }
        return;
      }

      try {
        const snapshot = await docRef<Record<string, unknown>>(`users/${user.uid}`).get();
        const generated = await generateIcebreakerPack({
          userProfile: (snapshot.data() ?? {}) as Record<string, unknown>,
          attendee,
        });

        if (isActive) {
          setData({
            name: attendee.linkedIn.name,
            role: attendee.linkedIn.headline,
            suggestions: [
              {
                type: "primary",
                label: "Primary Opening Line",
                text: generated.primaryLine,
                icon: "flash-outline",
              },
              {
                type: "followup",
                label: "Follow-Up Line",
                text: generated.followupLine,
                icon: "chatbubble-outline",
              },
              {
                type: "fallback",
                label: "Safe Fallback Line",
                text: generated.fallbackLine,
                icon: "shield-checkmark-outline",
              },
            ],
            rescueLines: generated.rescueLines,
          });
        }
      } catch {
        if (isActive) {
          setData({
            ...DEFAULT_DATA,
            name: attendee.linkedIn.name,
            role: attendee.linkedIn.headline,
          });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [id, user?.uid]);

  const handleSuggestionTap = () => {
    const msg = COACH_MESSAGES[Math.floor(Math.random() * COACH_MESSAGES.length)];
    setCoachMessage(msg);
    setShowCoach(true);
    coachOpacity.setValue(0);
    coachTranslate.setValue(-16);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(coachOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(coachTranslate, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2200),
      Animated.parallel([
        Animated.timing(coachOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(coachTranslate, {
          toValue: -16,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setShowCoach(false));
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xxl,
      paddingBottom: 140,
    },
    hero: { alignItems: "center", marginBottom: 28 },
    heroIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.gray,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 21,
      maxWidth: 300,
    },
    heroMatchName: { color: theme.colors.primary, fontWeight: "700" },
    loadingText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    card: {
      borderRadius: 16,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
    },
    primaryCard: {
      backgroundColor: "#F0FBF8",
      borderColor: "#A8DDD2",
    },
    secondaryCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: theme.spacing.md,
    },
    cardIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryIconWrap: { backgroundColor: "#C8EDE6" },
    secondaryIconWrap: { backgroundColor: theme.colors.gray },
    cardLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    primaryLabel: { color: theme.colors.primary },
    secondaryLabel: { color: theme.colors.textSecondary },
    cardText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.textPrimary,
      lineHeight: 24,
    },
    cardTapHint: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    refreshBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignSelf: "center",
      marginTop: 8,
    },
    refreshText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    rescueWrap: {
      position: "absolute",
      bottom: 24,
      left: 20,
      right: 20,
      alignItems: "center",
    },
    rescueBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    rescueBtnText: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: theme.spacing.lg,
      paddingBottom: 40,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
    },
    sheetHandle: {
      width: 48,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.gray,
      alignSelf: "center",
      marginBottom: 20,
    },
    sheetTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      textAlign: "center",
      marginBottom: 6,
    },
    sheetSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 19,
    },
    rescueLine: {
      backgroundColor: theme.colors.gray,
      borderRadius: 14,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    rescueLineTitle: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    rescueLineText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      lineHeight: 20,
    },
    generateRescueBtn: {
      marginTop: 14,
      backgroundColor: "#F0FBF8",
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#A8DDD2",
    },
    generateRescueBtnText: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    coachToast: {
      position: "absolute",
      top: 80,
      left: 20,
      right: 20,
      alignItems: "center",
      zIndex: 100,
    },
    coachInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.colors.textPrimary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    coachDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    coachText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.white,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Icebreaker Suggestions</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="chatbubbles-outline" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Break the Ice</Text>
          <Text style={styles.heroSubtitle}>
            Natural ways to start a meaningful conversation with <Text style={styles.heroMatchName}>{data.name}</Text>
          </Text>
        </View>

        {isLoading ? <Text style={styles.loadingText}>Generating personalized suggestions...</Text> : null}

        {data.suggestions.map((s, idx) => {
          const isPrimary = s.type === "primary";
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.75}
              style={[styles.card, isPrimary ? styles.primaryCard : styles.secondaryCard]}
              onPress={handleSuggestionTap}
            >
              <View style={styles.cardTop}>
                <View style={[styles.cardIconWrap, isPrimary ? styles.primaryIconWrap : styles.secondaryIconWrap]}>
                  <Ionicons name={s.icon} size={16} color={isPrimary ? theme.colors.primary : theme.colors.textSecondary} />
                </View>
                <Text style={[styles.cardLabel, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>{s.label}</Text>
              </View>
              <Text style={styles.cardText}>{s.text}</Text>
              <Text style={styles.cardTapHint}>Tap to log this interaction</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.7} onPress={() => router.replace(`/icebreaker/${id}`)}>
          <Ionicons name="refresh-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.refreshText}>Generate Another Suggestion</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.rescueWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.rescueBtn}
          activeOpacity={0.85}
          onPress={() => router.push("/ai-listening-engine")}
        >
          <Ionicons name="medkit-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.rescueBtnText}>Conversation Rescue</Text>
        </TouchableOpacity>
      </View>

      {showCoach && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.coachToast,
            {
              opacity: coachOpacity,
              transform: [{ translateY: coachTranslate }],
            },
          ]}
        >
          <View style={styles.coachInner}>
            <View style={styles.coachDot} />
            <Text style={styles.coachText}>{coachMessage}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
