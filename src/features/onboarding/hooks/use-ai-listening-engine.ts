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
  const [nudgeOptions, setNudgeOptions] = useState<string[]>([]);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const sessionRef = useRef<AiRealtimeSessionHandle | null>(null);

  const appendEvent = useCallback((type: AiClientEvent['type'], message: string) => {
    setEvents((prev) => [makeEvent(type, message), ...prev].slice(0, 24));
  }, []);

  const markStep = useCallback((step: EngineStepId) => {
    setCompletedSteps((prev) => ({ ...prev, [step]: true }));
  }, []);

  const parseNudgeOptions = useCallback((text: string): string[] => {
    return text
      .split('\n')
      .map((line) => line.replace(/^\s*[-*]?\s*\d*[.)-]?\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  }, []);

  const clearContextState = useCallback(() => {
    setCompletedSteps({});
    setEvents([]);
    setError(null);
    setLiveTranscript('');
    setNudgeText('');
    setNudgeOptions([]);
    setNudgeLoading(false);
    setHashtags([]);
  }, []);

  const clearRunState = useCallback(() => {
    setError(null);
    setCompletedSteps({ stop: false });
    setLiveTranscript('');
    setNudgeText('');
    setNudgeOptions([]);
    setNudgeLoading(false);
    setHashtags([]);
    setEvents([makeEvent('system', 'Starting AI listening engine...')]);
  }, []);

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

    setConnectionState('connecting');
    clearRunState();

    try {
      sessionRef.current = await startAiRealtimeSession({
        onConnected: () => {
          markStep('connect');
          setConnectionState('connected');
        },
        onStreaming: () => {
          markStep('stream');
          setConnectionState('streaming');
        },
        onSpeechObserved: () => {
          markStep('observe');
        },
        onTextDelta: (delta) => {
          markStep('event');
          setNudgeLoading(false);
          setNudgeText((prev) => {
            const next = `${prev}${delta}`;
            setNudgeOptions(parseNudgeOptions(next));
            return next;
          });
        },
        onInputTranscription: (heardText) => {
          appendTranscript(heardText);
        },
        onConversationItem: (text) => {
          markStep('event');
          setNudgeLoading(false);
          setNudgeOptions(parseNudgeOptions(text));
          setNudgeText((prev) => {
            if (!text) return prev;
            return prev ? `${prev}\n${text}` : text;
          });
        },
        onClientEvent: (type, message) => {
          appendEvent(type, message);
        },
        onStopped: () => {
          markStep('stop');
          setConnectionState('stopped');
        },
        onError: (sessionError) => {
          setConnectionState('error');
          setError(sessionError.message);
          setNudgeLoading(false);
          appendEvent('error', sessionError.message);
        },
      });
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : 'AI session start failed.';
      setConnectionState('error');
      setError(message);
      setNudgeLoading(false);
      appendEvent('error', message);
    }
  }, [appendEvent, appendTranscript, clearRunState, connectionState, markStep, parseNudgeOptions]);

  const stop = useCallback(() => {
    if (connectionState === 'idle' || connectionState === 'stopped') {
      return;
    }

    setConnectionState('stopping');
    void (async () => {
      await sessionRef.current?.stop();
      sessionRef.current = null;
      markStep('stop');
      setNudgeLoading(false);
      appendEvent('system', 'WebRTC peer connection closed.');
      setConnectionState('stopped');
    })();
  }, [appendEvent, connectionState, markStep]);

  const nudge = useCallback(() => {
    setNudgeText('');
    setNudgeOptions([]);
    setNudgeLoading(true);
    sessionRef.current?.nudge();
  }, []);

  const reset = useCallback(() => {
    void (async () => {
      await sessionRef.current?.stop();
      sessionRef.current = null;
      clearContextState();
      setConnectionState('idle');
    })();
  }, [clearContextState]);

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
    nudgeOptions,
    nudgeLoading,
    hashtags,
    statusText,
    start,
    stop,
    nudge,
    reset,
  };
};
