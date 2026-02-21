import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

import { useTheme } from "../../../../src/providers/theme-provider";

export default function StartNetworkingScreen({ id }: { id: string }) {
  const router = useRouter();
  const theme = useTheme();
  const [isSearching, setIsSearching] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState(0);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const messages = [
    "Analyzing compatibility...",
    "Detecting shared interests...",
    "Mapping conversational chemistry...",
    "Finding your best matches...",
  ];

  const handleStartNetworking = () => {
    setIsSearching(true);

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.xxl,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    welcome: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    name: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.textPrimary,
    },
    menuBtn: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.gray,
      borderRadius: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    badge: {
      color: theme.colors.primary,
      fontSize: 12,
      marginBottom: theme.spacing.sm,
      fontWeight: "600",
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    cardSub: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.lightGray,
      borderRadius: theme.radius.md,
      overflow: "hidden",
    },
    progressFill: {
      width: "75%",
      height: "100%",
      backgroundColor: theme.colors.primary,
    },
    progressText: {
      marginTop: theme.spacing.sm,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    centerArea: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
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
    mainButtonText: {
      marginTop: theme.spacing.md,
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.textPrimary,
    },
    subText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    searchContainer: {
      alignItems: "center",
    },
    spinner: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: theme.colors.primary,
      borderTopColor: "transparent",
      marginBottom: theme.spacing.lg,
    },
    thinkingText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    bottomNav: {
      height: 80,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    navItem: {
      alignItems: "center",
    },
    navText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
    navActive: {
      fontSize: 10,
      color: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcome}>Welcome,</Text>
            <Text style={styles.name}>Alex Johnson</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuBtn}>
          <Feather name="menu" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Event Card */}
      <View style={styles.card}>
        <Text style={styles.badge}>Live Event</Text>
        <Text style={styles.cardTitle}>TechCrunch Disrupt 2026</Text>
        <Text style={styles.cardSub}>Moscone Center • 12.5k Attendees</Text>

        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressText}>Day 2 of 3</Text>
      </View>

      {/* Center Area */}
      <View style={styles.centerArea}>
        {!isSearching ? (
          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.8}
            onPress={handleStartNetworking}
          >
            <Ionicons name="compass" size={40} color={theme.colors.primary} />
            <Text style={styles.mainButtonText}>Find My People</Text>
            <Text style={styles.subText}>AI-Powered Match</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.searchContainer}>
            <Animated.View
              style={[
                styles.spinner,
                {
                  transform: [{ rotate }],
                },
              ]}
            />
            <Text style={styles.thinkingText}>{messages[thinkingMessage]}</Text>
          </View>
        )}
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push(`/events/${id}/start-networking`)}
        >
          <Ionicons name="compass" size={24} color={theme.colors.primary} />
          <Text style={styles.navActive}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push(`/events/${id}/matches`)}
        >
          <Ionicons
            name="people"
            size={24}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.navText}>Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push(`/profile`)}
        >
          <Ionicons
            name="person"
            size={24}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
