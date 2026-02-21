import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ALL_EVENTS } from "../../../../src/data/events";
import { colors as COLORS } from "../../../../src/theme/tokens";

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = ALL_EVENTS.find((e) => e.id === id);

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.mediumGray} />
          <Text style={styles.notFoundText}>Event not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{event.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.eventName}>{event.name}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="business-outline" size={15} color={COLORS.mediumGray} />
            <Text style={styles.metaText}>{event.venue}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={15} color={COLORS.mediumGray} />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.mediumGray} />
            <Text style={styles.metaText}>{event.date}</Text>
          </View>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Ionicons name="people-outline" size={13} color={COLORS.primary} />
              <Text style={styles.chipText}>{event.attendeeCount} attendees</Text>
            </View>
            <View style={[styles.chip, styles.ticketChip]}>
              <Ionicons name="ticket-outline" size={13} color="#7C3AED" />
              <Text style={[styles.chipText, { color: "#7C3AED" }]}>{event.ticketPrice}</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            {event.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Event</Text>
          <Text style={styles.sectionBody}>{event.description}</Text>
        </View>

        {/* Speakers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Speakers</Text>
          {event.speakers.map((speaker) => (
            <View key={speaker.name} style={styles.speakerRow}>
              <View style={styles.speakerAvatar}>
                <Text style={styles.speakerInitial}>{speaker.name[0]}</Text>
              </View>
              <View style={styles.speakerInfo}>
                <Text style={styles.speakerName}>{speaker.name}</Text>
                <Text style={styles.speakerMeta}>
                  {speaker.role} · {speaker.company}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Agenda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agenda Highlights</Text>
          {event.agenda.map((item, idx) => (
            <View key={idx} style={styles.agendaRow}>
              <View style={styles.agendaTimeWrap}>
                <Text style={styles.agendaTime}>{item.time}</Text>
              </View>
              <View style={styles.agendaContent}>
                <Text style={styles.agendaTitle}>{item.title}</Text>
                {item.speaker ? (
                  <Text style={styles.agendaSpeaker}>{item.speaker}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* What to Expect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          {event.highlights.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Attend CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/events/[id]/start-networking",
              params: { id },
            })
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={COLORS.white}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.ctaText}>Attend this event</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/dashboard")}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.mediumGray} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/dashboard")}
        >
          <Ionicons name="calendar-outline" size={24} color={COLORS.mediumGray} />
          <Text style={styles.navText}>Registered</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="person-outline" size={24} color={COLORS.mediumGray} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 17, color: COLORS.mediumGray },
  backLink: { marginTop: 4 },
  backLinkText: { fontSize: 15, color: COLORS.primary, fontWeight: "600" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: COLORS.black },

  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

  heroCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F8F3",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  eventName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 7,
  },
  metaText: { fontSize: 14, color: COLORS.mediumGray },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E8F8F3",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ticketChip: {
    backgroundColor: "#F3EEFF",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  tagText: { fontSize: 12, color: COLORS.darkGray, fontWeight: "500" },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 14,
  },
  sectionBody: {
    fontSize: 15,
    color: COLORS.mediumGray,
    lineHeight: 23,
  },

  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  speakerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  speakerInitial: { fontSize: 18, fontWeight: "700", color: COLORS.white },
  speakerInfo: { flex: 1 },
  speakerName: { fontSize: 15, fontWeight: "700", color: COLORS.black },
  speakerMeta: { fontSize: 13, color: COLORS.mediumGray, marginTop: 2 },

  agendaRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  agendaTimeWrap: {
    width: 78,
    paddingTop: 2,
  },
  agendaTime: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  agendaContent: { flex: 1 },
  agendaTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    lineHeight: 20,
  },
  agendaSpeaker: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 2,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  bulletText: { fontSize: 15, color: COLORS.darkGray, flex: 1 },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    backgroundColor: COLORS.white,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 56,
  },
  ctaText: { fontSize: 16, fontWeight: "700", color: COLORS.white },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
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
    color: COLORS.mediumGray,
  },
});
