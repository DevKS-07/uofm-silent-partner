import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

import { useTheme } from "../../../../src/providers/theme-provider";
import { useAuth } from "../../../../src/providers/auth-provider";
import { ALL_EVENTS, type AppEvent } from "../../../../src/data/events";
import { getEventById } from "../../../../src/services/events";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { icon: "people-outline" as const,         label: "Scanning attendee profiles..." },
  { icon: "document-text-outline" as const,  label: "Analyzing your professional background..." },
  { icon: "heart-outline" as const,          label: "Detecting shared interests & goals..." },
  { icon: "chatbubbles-outline" as const,    label: "Mapping conversational chemistry..." },
  { icon: "trophy-outline" as const,         label: "Finalizing your top matches..." },
];

const STEP_MS = 1100; // per step → 5 × 1100 = 5 500 ms total

// ─── Component ────────────────────────────────────────────────────────────────

export default function StartNetworkingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<AppEvent | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadEvent = async () => {
      if (!id) {
        return;
      }

      try {
        const firestoreEvent = await getEventById(id);
        if (isActive) {
          setEvent(firestoreEvent ?? ALL_EVENTS.find((item) => item.id === id) ?? null);
        }
      } catch {
        if (isActive) {
          setEvent(ALL_EVENTS.find((item) => item.id === id) ?? null);
        }
      }
    };

    void loadEvent();

    return () => {
      isActive = false;
    };
  }, [id]);

  const displayName = useMemo(() => {
    const fromDisplayName = user?.displayName?.trim();
    if (fromDisplayName) {
      return fromDisplayName;
    }

    const email = user?.email?.trim() ?? "";
    if (email.includes("@")) {
      return email.split("@")[0];
    }

    return "Friend";
  }, [user?.displayName, user?.email]);

  const avatarInitial = displayName.charAt(0).toUpperCase() || "F";

  // 3 expanding rings
  const ring1Scale   = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale   = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring3Scale   = useRef(new Animated.Value(1)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;

  // Center orb gentle pulse
  const centerScale = useRef(new Animated.Value(1)).current;

  // Horizontal progress bar (width %, needs useNativeDriver: false)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Step text slide-in
  const stepOpacity   = useRef(new Animated.Value(0)).current;
  const stepTranslate = useRef(new Animated.Value(12)).current;

  // Result card reveal
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale   = useRef(new Animated.Value(0.6)).current;

  const alive = useRef(false);

  // ── Ring pulse (recursive so it self-resets) ──────────────────────────────
  const pulseRing = (scale: Animated.Value, opacity: Animated.Value) => {
    if (!alive.current) return;
    scale.setValue(1);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2.8,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,    duration: 1700, useNativeDriver: true }),
      ]),
    ]).start(({ finished }) => {
      if (finished) pulseRing(scale, opacity);
    });
  };

  // ── Animate step text into view ───────────────────────────────────────────
  const revealStep = (idx: number) => {
    setActiveStep(idx);
    stepOpacity.setValue(0);
    stepTranslate.setValue(12);
    Animated.parallel([
      Animated.timing(stepOpacity,   { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(stepTranslate, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleStartNetworking = () => {
    setIsSearching(true);
    setShowResult(false);
    setActiveStep(0);
    alive.current = true;

    // Staggered ring pulses
    pulseRing(ring1Scale, ring1Opacity);
    setTimeout(() => pulseRing(ring2Scale, ring2Opacity), 667);
    setTimeout(() => pulseRing(ring3Scale, ring3Opacity), 1334);

    // Gentle orb breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(centerScale, { toValue: 1.13, duration: 750, useNativeDriver: true }),
        Animated.timing(centerScale, { toValue: 1.00, duration: 750, useNativeDriver: true }),
      ]),
    ).start();

    // Progress bar fills over the full duration
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STEPS.length * STEP_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Cycle step messages
    revealStep(0);
    STEPS.slice(1).forEach((_, i) =>
      setTimeout(() => revealStep(i + 1), (i + 1) * STEP_MS),
    );

    // After all steps → show result → navigate
    setTimeout(() => {
      alive.current = false;
      setShowResult(true);
      Animated.parallel([
        Animated.spring(resultScale,   { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
        Animated.timing(resultOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
      setTimeout(() => router.push(`/events/${id}/matches`), 900);
    }, STEPS.length * STEP_MS + 400);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // ── Styles ────────────────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.xxl,
    },

    // ─ Top bar
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    profileRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
    avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.lightGray },
    avatarFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    avatarFallbackText: { color: theme.colors.white, fontWeight: "700", fontSize: 15 },
    welcome:    { fontSize: 12, color: theme.colors.textSecondary },
    name:       { fontSize: 14, fontWeight: "bold", color: theme.colors.textPrimary },
    menuBtn:    { padding: theme.spacing.sm, backgroundColor: theme.colors.gray, borderRadius: 20 },

    // ─ Event card
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    badge:        { color: theme.colors.primary, fontSize: 12, marginBottom: theme.spacing.sm, fontWeight: "600" },
    cardTitle:    { fontSize: 20, fontWeight: "bold", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
    cardSub:      { color: theme.colors.textSecondary, fontSize: 14, marginBottom: theme.spacing.md },
    progressBar:  { height: 6, backgroundColor: theme.colors.lightGray, borderRadius: theme.radius.md, overflow: "hidden" },
    progressFill: { width: "75%", height: "100%", backgroundColor: theme.colors.primary },
    progressText: { marginTop: theme.spacing.sm, fontSize: 12, color: theme.colors.textSecondary },

    // ─ Center area
    centerArea: { flex: 1, justifyContent: "center", alignItems: "center" },

    // ─ Idle button
    mainButton: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    mainButtonText: { marginTop: theme.spacing.md, fontSize: 16, fontWeight: "bold", color: theme.colors.textPrimary },
    subText:        { fontSize: 12, color: theme.colors.textSecondary },

    // ─ Loading state wrapper
    searchContainer: { alignItems: "center", width: "100%", paddingHorizontal: theme.spacing.xl },

    // ─ Orb + rings
    orbWrap: { width: 160, height: 160, alignItems: "center", justifyContent: "center", marginBottom: 32 },
    ring: {
      position: "absolute",
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    orb: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },

    // ─ Step indicator dots
    dotsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    dot:       { width: 8,  height: 8,  borderRadius: 4, backgroundColor: theme.colors.lightGray },
    dotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary, marginTop: -1 },
    dotDone:   { width: 8,  height: 8,  borderRadius: 4, backgroundColor: theme.colors.primary, opacity: 0.4 },

    // ─ Step text
    stepRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28, minHeight: 28 },
    stepIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#E8F8F3",
      alignItems: "center",
      justifyContent: "center",
    },
    stepText: { fontSize: 14, color: theme.colors.textPrimary, fontWeight: "500", flex: 1 },

    // ─ Progress track
    trackOuter: {
      width: "100%",
      height: 4,
      backgroundColor: theme.colors.lightGray,
      borderRadius: 2,
      overflow: "hidden",
    },
    trackFill: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 2 },

    // ─ Result reveal
    resultCard: {
      alignItems: "center",
      padding: 28,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      width: "90%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    resultIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#E8F8F3",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    resultCount:    { fontSize: 40, fontWeight: "800", color: theme.colors.textPrimary, lineHeight: 48 },
    resultLabel:    { fontSize: 16, fontWeight: "600", color: theme.colors.textPrimary, marginBottom: 6 },
    resultSub:      { fontSize: 13, color: theme.colors.textSecondary },

    // ─ Bottom nav
    bottomNav: {
      flexDirection: "row",
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingBottom: 8,
      paddingTop: 10,
    },
    navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
    navText: { fontSize: 11, fontWeight: "500", color: theme.colors.textSecondary },
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Top bar */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{avatarInitial}</Text>
            </View>
          )}
          <View>
            <Text style={styles.welcome}>Welcome,</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Feather name="menu" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Event card */}
      <View style={styles.card}>
        <Text style={styles.badge}>{event?.category || "Live Event"}</Text>
        <Text style={styles.cardTitle}>{event?.name || "Selected Event"}</Text>
        <Text style={styles.cardSub}>{(event?.venue || "Venue TBD") + " � " + (event?.attendeeCount || "TBD") + " Attendees"}</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressText}>{event?.date || "Event details loading..."}</Text>
      </View>

      {/* Center area */}
      <View style={styles.centerArea}>

        {/* ── Idle ────────────────────────────────────────── */}
        {!isSearching && (
          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.8}
            onPress={handleStartNetworking}
          >
            <Ionicons name="compass" size={40} color={theme.colors.primary} />
            <Text style={styles.mainButtonText}>Find My People</Text>
            <Text style={styles.subText}>AI-Powered Match</Text>
          </TouchableOpacity>
        )}

        {/* ── Loading ──────────────────────────────────────── */}
        {isSearching && !showResult && (
          <View style={styles.searchContainer}>

            {/* Orb + 3 expanding rings */}
            <View style={styles.orbWrap}>
              <Animated.View
                style={[styles.ring, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]}
              />
              <Animated.View
                style={[styles.ring, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]}
              />
              <Animated.View
                style={[styles.ring, { transform: [{ scale: ring3Scale }], opacity: ring3Opacity }]}
              />
              <Animated.View style={[styles.orb, { transform: [{ scale: centerScale }] }]}>
                <Ionicons name="compass" size={38} color={theme.colors.primary} />
              </Animated.View>
            </View>

            {/* Step dots */}
            <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={
                    i < activeStep
                      ? styles.dotDone
                      : i === activeStep
                      ? styles.dotActive
                      : styles.dot
                  }
                />
              ))}
            </View>

            {/* Current step text */}
            <Animated.View
              style={[
                styles.stepRow,
                { opacity: stepOpacity, transform: [{ translateY: stepTranslate }] },
              ]}
            >
              <View style={styles.stepIcon}>
                <Ionicons
                  name={STEPS[activeStep]?.icon ?? "ellipsis-horizontal"}
                  size={14}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.stepText}>{STEPS[activeStep]?.label ?? ""}</Text>
            </Animated.View>

            {/* Progress track */}
            <View style={styles.trackOuter}>
              <Animated.View style={[styles.trackFill, { width: progressWidth }]} />
            </View>

          </View>
        )}

        {/* ── Result ───────────────────────────────────────── */}
        {showResult && (
          <Animated.View
            style={[
              styles.resultCard,
              { opacity: resultOpacity, transform: [{ scale: resultScale }] },
            ]}
          >
            <View style={styles.resultIconWrap}>
              <Ionicons name="checkmark-circle" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.resultCount}>2</Text>
            <Text style={styles.resultLabel}>Perfect Matches Found!</Text>
            <Text style={styles.resultSub}>Taking you there now...</Text>
          </Animated.View>
        )}

      </View>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/dashboard")}
        >
          <Ionicons name="home-outline" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/dashboard")}
        >
          <Ionicons name="calendar-outline" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.navText}>Registered</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="person-outline" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

