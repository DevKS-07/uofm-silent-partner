import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../../providers/theme-provider";

const EVENTS = [
  {
    id: "1",
    name: "TechCrunch Disrupt",
    location: "San Francisco, CA",
    date: "Oct 12-14",
    accentColor: "#15B286",
  },
  {
    id: "2",
    name: "Web Summit Lisbon",
    location: "Lisbon, Portugal",
    date: "Nov 4-7",
    accentColor: "#15B286",
  },
  {
    id: "3",
    name: "SXSW Interactive",
    location: "Austin, TX",
    date: "Mar 8-10",
    accentColor: "#15B286",
  },
];

export const JoinEventScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const qrAnim = useRef(new Animated.Value(0)).current;
  const eventsLabelAnim = useRef(new Animated.Value(0)).current;
  const eventAnims = useRef(EVENTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        delay: 0,
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 400,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.timing(qrAnim, {
        toValue: 1,
        duration: 400,
        delay: 220,
        useNativeDriver: true,
      }),
      Animated.timing(eventsLabelAnim, {
        toValue: 1,
        duration: 400,
        delay: 320,
        useNativeDriver: true,
      }),
    ]).start();

    eventAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 380,
        delay: 400 + i * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [eventAnims, eventsLabelAnim, headerAnim, qrAnim, searchAnim]);

  const makeSlideStyle = (anim: Animated.Value, from: number) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [from, 0],
        }),
      },
    ],
  });

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.white },
    scroll: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: theme.colors.black,
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.mediumGray,
      lineHeight: 22,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.gray,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.black,
    },
    qrCard: {
      backgroundColor: "#F5F0FF",
      borderRadius: 16,
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: "center",
      marginBottom: 28,
      borderWidth: 1,
      borderColor: "#E0D0FF",
    },
    qrIconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#EDE5FF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#D4BEFF",
    },
    qrTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.black,
      marginBottom: 4,
    },
    qrSubtitle: {
      fontSize: 13,
      color: theme.colors.mediumGray,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.mediumGray,
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    eventCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.white,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    eventInfo: {
      flex: 1,
    },
    eventName: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.black,
      marginBottom: 5,
    },
    eventMeta: {
      flexDirection: "row",
      alignItems: "center",
    },
    eventMetaText: {
      fontSize: 12,
      color: theme.colors.mediumGray,
      marginLeft: 3,
    },
    arrowButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 12,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, makeSlideStyle(headerAnim, 28)]}>
          <Text style={styles.title}>Join Event</Text>
          <Text style={styles.subtitle}>
            Find your conference or meetup to start networking.
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.searchContainer, makeSlideStyle(searchAnim, 28)]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.mediumGray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an event..."
            placeholderTextColor={theme.colors.mediumGray}
          />
        </Animated.View>

        <Animated.View style={makeSlideStyle(qrAnim, 28)}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.qrCard}
            onPress={() => router.push("/qr-scanner")}
          >
            <View style={styles.qrIconWrapper}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.qrTitle}>Scan Event QR Code</Text>
            <Text style={styles.qrSubtitle}>
              Check-in instantly at the venue
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={makeSlideStyle(eventsLabelAnim, 28)}>
          <Text style={styles.sectionLabel}>POPULAR EVENTS</Text>
        </Animated.View>

        {EVENTS.map((event, i) => (
          <Animated.View
            key={event.id}
            style={makeSlideStyle(eventAnims[i], 24)}
          >
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.eventCard}
              onPress={() =>
                router.push(`/events/${event.id}/start-networking`)
              }
            >
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={styles.eventMeta}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={theme.colors.mediumGray}
                  />
                  <Text style={styles.eventMetaText}>{event.location}</Text>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={theme.colors.mediumGray}
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.eventMetaText}>{event.date}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.arrowButton,
                  { backgroundColor: event.accentColor },
                ]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.colors.white}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
