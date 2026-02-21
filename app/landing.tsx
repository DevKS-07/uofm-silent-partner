import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "../src/providers/theme-provider";

const { width, height } = Dimensions.get("window");

export default function Landing() {
  const router = useRouter();
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    content: {
      alignItems: "center",
      zIndex: 10,
    },
    orb: {
      position: "absolute",
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: width,
    },
    topOrb: {
      top: -height * 0.2,
      left: -width * 0.2,
      backgroundColor: `rgba(21, 178, 134, 0.08)`,
    },
    bottomOrb: {
      bottom: -height * 0.2,
      right: -width * 0.2,
      backgroundColor: `rgba(21, 178, 134, 0.05)`,
    },
    iconWrapper: {
      marginBottom: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    iconGlow: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      opacity: 0.1,
    },
    iconContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      letterSpacing: 1,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Background Orbs */}
      <View style={[styles.orb, styles.topOrb]} />
      <View style={[styles.orb, styles.bottomOrb]} />

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconGlow} />
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={40} color={theme.colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>VibeLink</Text>
        <Text style={styles.subtitle}>
          Meaningful connections. Powered by AI.
        </Text>
      </View>
    </View>
  );
}
