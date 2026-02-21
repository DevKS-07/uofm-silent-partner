import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  startAiRealtimeSession,
  type AiClientEvent,
  type AiConnectionState,
  type AiRealtimeSessionHandle,
} from '../../../services/ai';
import { generateHashtags } from '../services/hashtag-generator';

type EngineStepId = 'connect' | 'stream' | 'observe' | 'event' | 'stop';

type CompletedSteps = Partial<Record<EngineStepId, boolean>>;

const toNow = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

let eventCounter = 0;

const makeEvent = (type: AiClientEvent['type'], message: string): AiClientEvent => ({
  id: `${Date.now()}-${eventCounter++}`,
  type,
  message,
  createdAt: toNow(),
});

export const useAiListeningEngine = () => {
  const [connectionState, setConnectionState] = useState<AiConnectionState>('idle');
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({});
  const [events, setEvents] = useState<AiClientEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [nudgeText, setNudgeText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const sessionRef = useRef<AiRealtimeSessionHandle | null>(null);

  const appendTranscript = useCallback((nextText: string) => {
    setLiveTranscript((prev) => {
      const updated = `${prev} ${nextText}`.trim();
      setHashtags(generateHashtags(updated));
      return updated;
    });
  }, []);

  const start = useCallback(async () => {
    if (connectionState === 'connecting' || connectionState === 'streaming') {
      return;
    }

    setError(null);
    setConnectionState('connecting');
    setCompletedSteps({ stop: false });
    setLiveTranscript('');
    setNudgeText('');
    setHashtags([]);
    setEvents([makeEvent('system', 'Starting AI listening engine...')]);

    try {
      sessionRef.current = await startAiRealtimeSession({
        onConnected: () => {
          setCompletedSteps((prev) => ({ ...prev, connect: true }));
          setConnectionState('connected');
        },
        onStreaming: () => {
          setCompletedSteps((prev) => ({ ...prev, stream: true }));
          setConnectionState('streaming');
        },
        onSpeechObserved: () => {
          setCompletedSteps((prev) => ({ ...prev, observe: true }));
        },
        onTextDelta: (delta) => {
          setCompletedSteps((prev) => ({ ...prev, event: true }));
          setNudgeText((prev) => `${prev}${delta}`);
        },
        onInputTranscription: (heardText) => {
          appendTranscript(heardText);
        },
        onConversationItem: (text) => {
          setCompletedSteps((prev) => ({ ...prev, event: true }));
          setNudgeText((prev) => {
            if (!text) return prev;
            return prev ? `${prev}\n${text}` : text;
          });
        },
        onClientEvent: (type, message) => {
          setEvents((prev) => [makeEvent(type, message), ...prev].slice(0, 24));
        },
        onStopped: () => {
          setCompletedSteps((prev) => ({ ...prev, stop: true }));
          setConnectionState('stopped');
        },
        onError: (sessionError) => {
          setConnectionState('error');
          setError(sessionError.message);
          setEvents((prev) => [makeEvent('error', sessionError.message), ...prev].slice(0, 24));
        },
      });
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : 'AI session start failed.';
      setConnectionState('error');
      setError(message);
      setEvents((prev) => [makeEvent('error', message), ...prev]);
    }
  }, [appendTranscript, connectionState]);

  const stop = useCallback(() => {
    if (connectionState === 'idle' || connectionState === 'stopped') {
      return;
    }

    setConnectionState('stopping');
    void (async () => {
      await sessionRef.current?.stop();
      sessionRef.current = null;
      setCompletedSteps((prev) => ({ ...prev, stop: true }));
      setEvents((prev) => [makeEvent('system', 'WebRTC peer connection closed.'), ...prev]);
      setConnectionState('stopped');
    })();
  }, [connectionState]);

  const nudge = useCallback(() => {
    setNudgeText('');
    sessionRef.current?.nudge();
  }, []);

  const statusText = useMemo(() => {
    switch (connectionState) {
      case 'idle':
        return 'Idle';
      case 'connecting':
        return 'Connecting';
      case 'connected':
        return 'Connected';
      case 'streaming':
        return 'Streaming';
      case 'stopping':
        return 'Stopping';
      case 'stopped':
        return 'Stopped';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  }, [connectionState]);

  useEffect(() => {
    return () => {
      void sessionRef.current?.stop();
      sessionRef.current = null;
    };
  }, []);

  return {
    connectionState,
    completedSteps,
    events,
    error,
    liveTranscript,
    nudgeText,
    hashtags,
    statusText,
    start,
    stop,
    nudge,
  };
};
