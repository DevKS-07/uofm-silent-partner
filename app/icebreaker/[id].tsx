import { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
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

// ─── Data ─────────────────────────────────────────────────────────────────────

type SuggestionType = "primary" | "followup" | "fallback";

type Suggestion = {
  type: SuggestionType;
  label: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type IcebreakerData = {
  name: string;
  role: string;
  suggestions: Suggestion[];
};

const ICEBREAKERS: Record<string, IcebreakerData> = {
  "1": {
    name: "Sarah Chen",
    role: "Senior Product Manager at Google",
    suggestions: [
      {
        type: "primary",
        label: "Primary Opening Line",
        text: "I saw you're interested in AI-driven Growth. How do you see LLMs changing product discovery in the next year?",
        icon: "flash-outline",
      },
      {
        type: "followup",
        label: "Follow-Up Line",
        text: "Your background in FinTech is fascinating. Did you find the transition to general product management challenging?",
        icon: "chatbubble-outline",
      },
      {
        type: "fallback",
        label: "Safe Fallback Line",
        text: "Hi Sarah, I'm also attending the 'Future of Tech' talk later. Are you looking forward to any specific speakers?",
        icon: "shield-checkmark-outline",
      },
    ],
  },
  "2": {
    name: "David Miller",
    role: "VC Partner at Sequoia",
    suggestions: [
      {
        type: "primary",
        label: "Primary Opening Line",
        text: "I noticed you're investing in Seed-stage AI startups. What metrics matter most to you beyond the team at that stage?",
        icon: "flash-outline",
      },
      {
        type: "followup",
        label: "Follow-Up Line",
        text: "Your B2B marketplace thesis is compelling. Are you seeing more founder-led sales or PLG approaches winning right now?",
        icon: "chatbubble-outline",
      },
      {
        type: "fallback",
        label: "Safe Fallback Line",
        text: "Hi David, great to be at the same conference. Are you joining any of the fireside chats this afternoon?",
        icon: "shield-checkmark-outline",
      },
    ],
  },
};

const FALLBACK_DATA: IcebreakerData = {
  name: "New Connection",
  role: "Tech Professional",
  suggestions: [
    {
      type: "primary",
      label: "Primary Opening Line",
      text: "I noticed we share a passion for scalable architecture. What's the most interesting challenge you've tackled recently?",
      icon: "flash-outline",
    },
    {
      type: "followup",
      label: "Follow-Up Line",
      text: "It looks like we're both exploring the startup ecosystem here. What sector are you most excited about right now?",
      icon: "chatbubble-outline",
    },
    {
      type: "fallback",
      label: "Safe Fallback Line",
      text: "Hi, I'm just getting settled in. Have you found any interesting sessions or booths so far?",
      icon: "shield-checkmark-outline",
    },
  ],
};

const COACH_MESSAGES = [
  "Nice 👏 That looked like a meaningful interaction.",
  "Strong conversational energy detected.",
  "Momentum unlocked 🚀 Keep going.",
];

const RESCUE_LINES = [
  {
    title: "Soft Pivot",
    text: "By the way, have you seen any other interesting talks today?",
  },
  {
    title: "Curiosity Pivot",
    text: "What's your take on the keynote speaker's point about AI?",
  },
  {
    title: "Social Pivot",
    text: "Are you planning to attend the networking mixer later?",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function IcebreakerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const matchData = id && ICEBREAKERS[id] ? ICEBREAKERS[id] : FALLBACK_DATA;

  const [showRescue, setShowRescue] = useState(false);
  const [coachMessage, setCoachMessage] = useState("");
  const [showCoach, setShowCoach] = useState(false);

  const coachOpacity = useRef(new Animated.Value(0)).current;
  const coachTranslate = useRef(new Animated.Value(-16)).current;

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
      Animated.delay(2400),
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

    // Hero
    hero: { alignItems: "center", marginBottom: 32 },
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
      maxWidth: 280,
    },
    heroMatchName: {
      color: theme.colors.primary,
      fontWeight: "600",
    },

    // Suggestion cards
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

    // Refresh
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

    // Rescue FAB
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

    // Rescue bottom sheet
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

    // Coach toast
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Icebreaker Suggestions</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons
              name="chatbubbles-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.heroTitle}>Break the Ice ❄️</Text>
          <Text style={styles.heroSubtitle}>
            Natural ways to start a meaningful conversation with{" "}
            <Text style={styles.heroMatchName}>{matchData.name}</Text>
          </Text>
        </View>

        {/* Suggestion Cards */}
        {matchData.suggestions.map((s, idx) => {
          const isPrimary = s.type === "primary";
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.75}
              style={[styles.card, isPrimary ? styles.primaryCard : styles.secondaryCard]}
              onPress={handleSuggestionTap}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.cardIconWrap,
                    isPrimary ? styles.primaryIconWrap : styles.secondaryIconWrap,
                  ]}
                >
                  <Ionicons
                    name={s.icon}
                    size={16}
                    color={isPrimary ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.cardLabel,
                    isPrimary ? styles.primaryLabel : styles.secondaryLabel,
                  ]}
                >
                  {s.label}
                </Text>
              </View>
              <Text style={styles.cardText}>"{s.text}"</Text>
              <Text style={styles.cardTapHint}>Tap to log this interaction</Text>
            </TouchableOpacity>
          );
        })}

        {/* Generate Another */}
        <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.7}>
          <Ionicons
            name="refresh-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.refreshText}>Generate Another Suggestion</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Conversation Rescue FAB */}
      <View style={styles.rescueWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.rescueBtn}
          activeOpacity={0.85}
          onPress={() => setShowRescue(true)}
        >
          <Ionicons name="medkit-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.rescueBtnText}>Conversation Rescue 🚑</Text>
        </TouchableOpacity>
      </View>

      {/* Conversation Rescue Bottom Sheet */}
      <Modal
        visible={showRescue}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRescue(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowRescue(false)}>
          <Pressable onPress={() => {}}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Conversation Rescue 🚑</Text>
              <Text style={styles.sheetSubtitle}>
                If the conversation feels stuck, try one of these.
              </Text>

              {RESCUE_LINES.map((line, i) => (
                <View key={i} style={styles.rescueLine}>
                  <Text style={styles.rescueLineTitle}>{line.title}</Text>
                  <Text style={styles.rescueLineText}>{line.text}</Text>
                </View>
              ))}

              <TouchableOpacity style={styles.generateRescueBtn} activeOpacity={0.85}>
                <Text style={styles.generateRescueBtnText}>Generate Rescue Line</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confidence Coach Toast */}
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
