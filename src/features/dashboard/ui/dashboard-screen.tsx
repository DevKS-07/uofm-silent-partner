import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { useAuth } from "../../../providers/auth-provider";
import { docRef } from "../../../services/firebase/firestore";
import { colors as COLORS } from "../../../theme/tokens";
import type { AppEvent } from "../../../data/events";
import { getAllEvents, getPopularEvents } from "../../../services/events";

const POPULAR_COUNT = 3;

type Tab = "events" | "registered";

const useSlideIn = (delay: number) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });
  return { opacity: anim, transform: [{ translateY }] };
};

const EventCard = ({
  event,
  onPress,
}: {
  event: AppEvent;
  onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.88} style={styles.eventCard} onPress={onPress}>
    <View style={styles.eventInfo}>
      <Text style={styles.eventName}>{event.name}</Text>
      <View style={styles.eventMeta}>
        <Ionicons name="location-outline" size={13} color={COLORS.mediumGray} />
        <Text style={styles.eventMetaText}>{event.location}</Text>
        <Ionicons
          name="calendar-outline"
          size={13}
          color={COLORS.mediumGray}
          style={{ marginLeft: 10 }}
        />
        <Text style={styles.eventMetaText}>{event.date}</Text>
      </View>
    </View>
    <View style={styles.arrowButton}>
      <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
    </View>
  </TouchableOpacity>
);

const JoinEventScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<AppEvent[]>([]);
  const [popularEvents, setPopularEvents] = useState<AppEvent[]>([]);
  const [allEvents, setAllEvents] = useState<AppEvent[]>([]);
  const [isLoadingPopularEvents, setIsLoadingPopularEvents] = useState(true);
  const [popularEventsError, setPopularEventsError] = useState<string | null>(null);

  const headerAnim = useSlideIn(0);
  const searchAnim = useSlideIn(120);
  const qrAnim = useSlideIn(220);
  const eventsLabelAnim = useSlideIn(320);

  useEffect(() => {
    if (!user) {
      setRegisteredEvents([]);
      return;
    }

    const unsubscribe = docRef<Record<string, any>>(`users/${user.uid}`).onSnapshot(
      (snap) => {
        if (!snap.exists) {
          setRegisteredEvents([]);
          return;
        }

        const data = snap.data();
        setRegisteredEvents(Array.isArray(data?.registeredEvents) ? data.registeredEvents : []);
      },
      () => {
        setRegisteredEvents([]);
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let isActive = true;

    const loadPopularEvents = async () => {
      setIsLoadingPopularEvents(true);
      setPopularEventsError(null);
      try {
        const [popular, all] = await Promise.all([getPopularEvents(), getAllEvents()]);
        if (isActive) {
          setPopularEvents(popular);
          setAllEvents(all);
        }
      } catch {
        if (isActive) {
          setPopularEventsError("Couldn't load popular events right now.");
        }
      } finally {
        if (isActive) {
          setIsLoadingPopularEvents(false);
        }
      }
    };

    void loadPopularEvents();

    return () => {
      isActive = false;
    };
  }, []);

  const displayedEvents = showAllEvents
    ? allEvents
    : popularEvents.slice(0, POPULAR_COUNT);

  // ─── Events tab ────────────────────────────────────────────────────────────

  const renderEventsTab = () => (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.header, headerAnim]}>
        <Text style={styles.title}>Join Event</Text>
        <Text style={styles.subtitle}>
          Find your conference or meetup to start networking.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.searchContainer, searchAnim]}>
        <Ionicons
          name="search-outline"
          size={18}
          color={COLORS.mediumGray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for an event..."
          placeholderTextColor={COLORS.mediumGray}
        />
      </Animated.View>

      <Animated.View style={qrAnim}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.qrCard}
          onPress={() => router.push("/qr-scanner")}
        >
          <View style={styles.qrIconWrapper}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={32}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.qrTitle}>Scan Event QR Code</Text>
          <Text style={styles.qrSubtitle}>Check-in instantly at the venue</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.sectionRow, eventsLabelAnim]}>
        <Text style={styles.sectionLabel}>POPULAR EVENTS</Text>
        <TouchableOpacity onPress={() => setShowAllEvents((v) => !v)}>
          <Text style={styles.seeAllText}>
            {showAllEvents ? "Show less" : "See all"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {isLoadingPopularEvents ? (
        <Text style={styles.helperText}>Loading popular events...</Text>
      ) : popularEventsError ? (
        <Text style={styles.helperText}>{popularEventsError}</Text>
      ) : displayedEvents.length === 0 ? (
        <Text style={styles.helperText}>No popular events available yet.</Text>
      ) : (
        displayedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() =>
              router.push({
                pathname: '/events/[id]',
                params: { id: event.id },
              })
            }
          />
        ))
      )}
    </ScrollView>
  );

  // ─── Registered tab ────────────────────────────────────────────────────────

  const renderRegisteredTab = () => (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.tabPageTitle}>Registered Events</Text>
      {registeredEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-outline"
            size={56}
            color={COLORS.lightGray}
          />
          <Text style={styles.emptyTitle}>No Registered Events</Text>
          <Text style={styles.emptySubtitle}>
            Events you join will appear here.
          </Text>
        </View>
      ) : (
        registeredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() =>
              router.push({
                pathname: '/events/[id]',
                params: { id: event.id },
              })
            }
          />
        ))
      )}
    </ScrollView>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {activeTab === "events" && renderEventsTab()}
        {activeTab === "registered" && renderRegisteredTab()}
      </View>

      <View style={styles.tabBar}>
        {(
          [
            { key: "events", label: "Events", icon: "home" },
            { key: "registered", label: "Registered", icon: "calendar" },
          ] as { key: Tab; label: string; icon: string }[]
        ).map(({ key, label, icon }) => {
          const active = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={styles.tabItem}
              onPress={() => setActiveTab(key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={(active ? icon : `${icon}-outline`) as any}
                size={24}
                color={active ? COLORS.primary : COLORS.mediumGray}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/communication-assist")}
          activeOpacity={0.8}
        >
          <Ionicons name="mic-outline" size={24} color={COLORS.mediumGray} />
          <Text style={styles.tabLabel}>Assist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          <Ionicons name="person-outline" size={24} color={COLORS.mediumGray} />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },

  // Events tab
  header: { marginBottom: 24, alignItems: "center" },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    lineHeight: 22,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.black },
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
    color: COLORS.black,
    marginBottom: 4,
  },
  qrSubtitle: { fontSize: 13, color: COLORS.mediumGray },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.mediumGray,
    letterSpacing: 1.2,
  },
  seeAllText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  helperText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginTop: 8,
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  eventInfo: { flex: 1 },
  eventName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 5,
  },
  eventMeta: { flexDirection: "row", alignItems: "center" },
  eventMetaText: { fontSize: 12, color: COLORS.mediumGray, marginLeft: 3 },
  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // Registered tab
  tabPageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    textAlign: "center",
    lineHeight: 20,
  },

  // Bottom tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    paddingBottom: 8,
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  tabLabel: { fontSize: 11, fontWeight: "500", color: COLORS.mediumGray },
  tabLabelActive: { color: COLORS.primary, fontWeight: "700" },
});

export default JoinEventScreen;
