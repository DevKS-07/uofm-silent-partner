import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../providers/theme-provider';
import { useAiListeningEngine } from '../hooks/use-ai-listening-engine';

type EngineStepId = 'connect' | 'stream' | 'observe' | 'event' | 'stop';

type EngineStep = {
  id: EngineStepId;
  label: string;
  description: string;
};

const FLOW_STEPS: EngineStep[] = [
  {
    id: 'connect',
    label: 'Start Button',
    description: 'Open a WebRTC connection to OpenAI.',
  },
  {
    id: 'stream',
    label: 'Streaming',
    description: 'Your microphone sends audio chunks to OpenAI.',
  },
  {
    id: 'observe',
    label: 'Observation',
    description: 'OpenAI VAD (Voice Activity Detection) hears speech.',
  },
  {
    id: 'event',
    label: 'The Event',
    description:
      'Listen for response.output_text.delta or conversation.item.created on the client.',
  },
  {
    id: 'stop',
    label: 'Stop Button',
    description: 'Close the WebRTC peer connection.',
  },
];

export const AiListeningEngineScreen = () => {
  const theme = useTheme();
  const engine = useAiListeningEngine();
  const isRunning = engine.connectionState === 'streaming' || engine.connectionState === 'connecting';

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.black,
      marginBottom: 8,
    },
    subtitle: {
      color: theme.colors.mediumGray,
      fontSize: 14,
      marginBottom: 14,
    },
    statusRow: {
      marginBottom: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      backgroundColor: theme.colors.gray,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusLabel: {
      color: theme.colors.darkGray,
      fontSize: 14,
      fontWeight: '600',
    },
    statusValue: {
      color: isRunning ? theme.colors.primary : theme.colors.mediumGray,
      fontSize: 14,
      fontWeight: '700',
    },
    controls: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    singleActionRow: {
      marginBottom: 12,
    },
    button: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
    buttonTextDark: {
      color: theme.colors.darkGray,
      fontSize: 15,
      fontWeight: '700',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 13,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: theme.colors.mediumGray,
      marginBottom: 8,
    },
    stepCard: {
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 12,
      backgroundColor: theme.colors.white,
      padding: 12,
      marginBottom: 10,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.black,
      marginBottom: 4,
    },
    stepText: {
      fontSize: 13,
      color: theme.colors.darkGray,
      lineHeight: 18,
    },
    stepDone: {
      borderColor: theme.colors.primary,
      backgroundColor: '#EEFBF7',
    },
    eventPanel: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 12,
      backgroundColor: theme.colors.gray,
      padding: 10,
      minHeight: 160,
      marginBottom: 20,
    },
    eventText: {
      color: theme.colors.darkGray,
      fontSize: 12,
      marginBottom: 6,
    },
    emptyEventText: {
      color: theme.colors.mediumGray,
      fontSize: 12,
    },
    transcriptPanel: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 12,
      backgroundColor: theme.colors.white,
      padding: 12,
      minHeight: 110,
      marginBottom: 12,
    },
    transcriptText: {
      color: theme.colors.darkGray,
      fontSize: 13,
      lineHeight: 20,
    },
    hashtagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
      marginBottom: 16,
    },
    hashtagChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: '#EEFBF7',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    hashtagText: {
      color: theme.colors.primaryDark,
      fontSize: 12,
      fontWeight: '700',
    },
    nudgePanel: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      backgroundColor: '#EEFBF7',
      padding: 12,
      minHeight: 72,
      marginBottom: 12,
    },
    nudgeText: {
      color: theme.colors.primaryDark,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>AI Listening Engine</Text>
        <Text style={styles.subtitle}>Communication flow for realtime speech with OpenAI.</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Engine Status</Text>
          <Text style={styles.statusValue}>{engine.statusText}</Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={[styles.button, styles.primaryButton, isRunning ? styles.buttonDisabled : null]}
            disabled={isRunning}
            onPress={() => void engine.start()}
          >
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.secondaryButton, !isRunning ? styles.buttonDisabled : null]}
            disabled={!isRunning}
            onPress={engine.stop}
          >
            <Text style={styles.buttonTextDark}>Stop</Text>
          </Pressable>
        </View>
        <View style={styles.singleActionRow}>
          <Pressable
            style={[styles.button, styles.primaryButton, !isRunning ? styles.buttonDisabled : null]}
            disabled={!isRunning}
            onPress={engine.nudge}
          >
            <Text style={styles.buttonText}>Nudge Me</Text>
          </Pressable>
        </View>

        {engine.error ? <Text style={styles.errorText}>{engine.error}</Text> : null}

        <Text style={styles.sectionTitle}>THE COMMUNICATION FLOW</Text>
        {FLOW_STEPS.map((step) => (
          <View
            key={step.id}
            style={[styles.stepCard, engine.completedSteps[step.id] ? styles.stepDone : null]}
          >
            <Text style={styles.stepTitle}>{step.label}</Text>
            <Text style={styles.stepText}>{step.description}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>LIVE TRANSCRIPT</Text>
        <View style={styles.transcriptPanel}>
          {engine.liveTranscript ? (
            <Text style={styles.transcriptText}>{engine.liveTranscript}</Text>
          ) : (
            <Text style={styles.emptyEventText}>Transcript will appear while conversation is detected.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>GENERATED HASHTAGS</Text>
        {engine.hashtags.length > 0 ? (
          <View style={styles.hashtagRow}>
            {engine.hashtags.map((tag) => (
              <View key={tag} style={styles.hashtagChip}>
                <Text style={styles.hashtagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyEventText}>Hashtags will be generated from the live transcript.</Text>
        )}

        <Text style={styles.sectionTitle}>NUDGE</Text>
        <View style={styles.nudgePanel}>
          {engine.nudgeText ? (
            <Text style={styles.nudgeText}>{engine.nudgeText}</Text>
          ) : (
            <Text style={styles.emptyEventText}>
              Tap "Nudge Me" when you get stuck. The assistant will suggest your next line.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>CLIENT EVENTS</Text>
        <View style={styles.eventPanel}>
          {engine.events.length === 0 ? (
            <Text style={styles.emptyEventText}>
              No events yet. Press Start to open WebRTC and stream events.
            </Text>
          ) : (
            engine.events.map((event) => (
              <Text key={event.id} style={styles.eventText}>
                [{event.createdAt}] {event.type}: {event.message}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
