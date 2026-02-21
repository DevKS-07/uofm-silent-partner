import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors as COLORS } from "../../../theme/tokens";

type PhraseGroup = {
  category: string;
  icon: string;
  phrases: string[];
};

const PHRASE_GROUPS: PhraseGroup[] = [
  {
    category: "Greetings",
    icon: "hand-left-outline",
    phrases: [
      "Hello 👋",
      "Hi, nice to meet you 🙂",
      "Mind if I join you?",
      "How's the event going for you?",
      "What brings you here today?",
      "Is this your first time at this event?",
    ],
  },
  {
    category: "Professional",
    icon: "briefcase-outline",
    phrases: [
      "What do you work on?",
      "What industry are you in?",
      "What kind of projects are you working on?",
      "How did you get into your field?",
      "What's your role like?",
      "Are you working on anything exciting lately?",
    ],
  },
  {
    category: "Interests",
    icon: "sparkles-outline",
    phrases: [
      "That's really interesting",
      "I'd love to hear more about that",
      "How does that work?",
      "What inspired you to do that?",
      "That sounds exciting",
      "What challenges are you seeing in your space?",
    ],
  },
  {
    category: "Connection",
    icon: "people-outline",
    phrases: [
      "Would love to stay in touch",
      "Are you on LinkedIn?",
      "Can we connect?",
      "I'd love to continue this conversation later",
      "This was a great conversation",
    ],
  },
  {
    category: "Fillers",
    icon: "chatbubble-ellipses-outline",
    phrases: [
      "That makes sense",
      "Totally agree",
      "That's a great point",
      "Interesting perspective",
    ],
  },
  {
    category: "Conversation Rescue",
    icon: "bulb-outline",
    phrases: [
      "What are you hoping to get out of this event?",
      "Have you attended similar events before?",
      "What trends are you most excited about?",
      "What's been your favorite part of the event so far?",
    ],
  },
  {
    category: "Polite Exits",
    icon: "walk-outline",
    phrases: [
      "It was great talking to you",
      "Really enjoyed our conversation",
      "Hope you enjoy the rest of the event",
      "I'll let you mingle 🙂",
      "Thanks for the chat 🙏",
    ],
  },
];

export const CommunicationAssistScreen = () => {
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => {
    Speech.stop();
  }, []);

  const handlePhrasePress = (phrase: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.stop();

    setSelectedPhrase(phrase);
    setSpeaking(true);

    const cleaned = phrase.replace(/[^\w\s',.!?]/gu, "").trim();
    const chunks = cleaned
      .split(/(?<=[.!?,])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const speakChunks = (remaining: string[]) => {
      if (remaining.length === 0) {
        setSpeaking(false);
        return;
      }
      const [head, ...tail] = remaining;
      Speech.speak(head, {
        rate: 0.95,
        pitch: 1.0,
        onDone: () => speakChunks(tail),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    };

    speakChunks(chunks.length > 0 ? chunks : [cleaned]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communication Assist</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Tap a phrase to speak it aloud</Text>

        <View style={styles.displayCard}>
          {selectedPhrase ? (
            <>
              <View style={styles.displayCardHeader}>
                <Ionicons
                  name={speaking ? "volume-high" : "volume-high-outline"}
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.displayCardLabel}>
                  {speaking ? "Speaking..." : "Last spoken"}
                </Text>
              </View>
              <Text style={styles.displayText}>{selectedPhrase}</Text>
            </>
          ) : (
            <View style={styles.displayPlaceholder}>
              <Ionicons name="mic-outline" size={32} color={COLORS.mediumGray} />
              <Text style={styles.displayPlaceholderText}>
                Select a phrase below to speak it
              </Text>
            </View>
          )}
        </View>

        {PHRASE_GROUPS.map((group) => (
          <View key={group.category} style={styles.group}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIconWrap}>
                <Ionicons
                  name={group.icon as any}
                  size={14}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.sectionLabel}>{group.category.toUpperCase()}</Text>
            </View>

            <View style={styles.grid}>
              {group.phrases.map((phrase) => {
                const isActive = selectedPhrase === phrase;
                return (
                  <Pressable
                    key={phrase}
                    style={({ pressed }) => [
                      styles.phraseButton,
                      isActive && styles.phraseButtonActive,
                      pressed && styles.phraseButtonPressed,
                    ]}
                    onPress={() => handlePhrasePress(phrase)}
                  >
                    <Text
                      style={[
                        styles.phraseText,
                        isActive && styles.phraseTextActive,
                      ]}
                    >
                      {phrase}
                    </Text>
                    {isActive ? (
                      <Ionicons
                        name={speaking ? "volume-high" : "checkmark-circle"}
                        size={14}
                        color={COLORS.primary}
                        style={styles.phraseActiveIcon}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.black,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 20,
  },
  displayCard: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 28,
    minHeight: 100,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  displayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  displayCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  displayText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.black,
    lineHeight: 28,
  },
  displayPlaceholder: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  displayPlaceholderText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    textAlign: "center",
  },
  group: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  groupIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#E8F8F3",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.mediumGray,
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  phraseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 6,
  },
  phraseButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#F0FBF7",
  },
  phraseButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  phraseText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.darkGray,
    flexShrink: 1,
  },
  phraseTextActive: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  phraseActiveIcon: {
    marginLeft: 2,
  },
});

