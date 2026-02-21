import { mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

import { fetchAiSessionCredentials } from './session-client';
import type { AiEventType, AiRealtimeCallbacks, AiRealtimeSessionHandle } from './types';

type RealtimeServerEvent = {
  type?: string;
  delta?: string;
  text?: string;
  item?: {
    content?: Array<{
      transcript?: string;
      text?: string;
    }>;
  };
  error?: {
    message?: string;
  };
};

type DataChannelLike = {
  send: (data: string) => void;
};

const SILENT_COACH_SESSION_INSTRUCTIONS =
  'You are a silent social coach. Always use English only. Do not proactively respond. Listen continuously. ' +
  'Track tone, energy, and social dynamics (friendly, formal, playful, serious). ' +
  'Assume the device owner is the person asking for help, and any other voice is the conversation partner. ' +
  'Only produce output when the client explicitly sends response.create asking for a nudge.';

const NUDGE_RESPONSE_INSTRUCTIONS =
  'English only. You are writing lines for the device owner (me) to say next, never for the other speaker. ' +
  'If speaker identity is uncertain, still default to writing my next line only. ' +
  'Output exactly three short spoken options I could say next, each under 18 words. ' +
  'Return plain text with each option on a new line only, no numbering, no bullets, no labels. ' +
  'Prefer a natural sentence that can start with I, That, Sounds, or Thanks. ' +
  'Mirror the current tone of the conversation: if playful, be witty; if serious, be respectful and grounded. ' +
  'Use light humor only when context supports it, never forced. ' +
  "Do not write the other person's reply. Do not give advice about what I should do. " +
  'Do not add labels, quotes, or explanations.';

const toClientEventType = (value?: string): AiEventType => {
  switch (value) {
    case 'response.output_text.delta':
    case 'conversation.item.created':
    case 'conversation.item.input_audio_transcription.completed':
    case 'input_audio_buffer.speech_started':
    case 'input_audio_buffer.speech_stopped':
      return value;
    default:
      return 'system';
  }
};

const pickConversationText = (payload: RealtimeServerEvent): string => {
  const segments = payload.item?.content ?? [];
  const text = segments
    .map((segment) => segment.transcript ?? segment.text ?? '')
    .filter(Boolean)
    .join(' ')
    .trim();
  return text;
};

const isSpeechEventType = (
  eventType?: string,
): eventType is 'input_audio_buffer.speech_started' | 'input_audio_buffer.speech_stopped' =>
  eventType === 'input_audio_buffer.speech_started' || eventType === 'input_audio_buffer.speech_stopped';

const sendSessionUpdate = (
  dataChannel: DataChannelLike,
  callbacks: AiRealtimeCallbacks,
  emit: (type: AiEventType, message: string) => void,
) => {
  const sessionUpdate = {
    type: 'session.update',
    session: {
      type: 'realtime',
      instructions: SILENT_COACH_SESSION_INSTRUCTIONS,
      output_modalities: ['text'],
      audio: {
        input: {
          turn_detection: { type: 'server_vad', create_response: false },
        },
      },
    },
  };

  try {
    dataChannel.send(JSON.stringify(sessionUpdate));
    callbacks.onStreaming?.();
    emit('webrtc', 'Session updated with server VAD + text streaming.');
  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error('Failed to send session.update.'));
  }
};

const sendNudgeRequest = (
  dataChannel: DataChannelLike,
  callbacks: AiRealtimeCallbacks,
  emit: (type: AiEventType, message: string) => void,
) => {
  try {
    const createResponse = {
      type: 'response.create',
      response: {
        output_modalities: ['text'],
        instructions: NUDGE_RESPONSE_INSTRUCTIONS,
      },
    };
    dataChannel.send(JSON.stringify(createResponse));
    emit('system', 'Nudge requested.');
  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error('Failed to request a nudge response.'));
  }
};

const handleRealtimePayload = (payload: RealtimeServerEvent, callbacks: AiRealtimeCallbacks) => {
  const eventType = toClientEventType(payload.type);

  if (payload.type === 'response.output_text.delta') {
    const deltaText = payload.delta ?? payload.text ?? '';
    if (deltaText) {
      callbacks.onTextDelta?.(deltaText);
      callbacks.onClientEvent?.('response.output_text.delta', deltaText);
    }
  }

  if (payload.type === 'conversation.item.created') {
    const conversationText = pickConversationText(payload);
    if (conversationText) {
      callbacks.onConversationItem?.(conversationText);
    }
    callbacks.onClientEvent?.('conversation.item.created', conversationText || 'Conversation item created.');
  }

  if (payload.type === 'conversation.item.input_audio_transcription.completed') {
    const transcriptText = payload.text ?? pickConversationText(payload);
    if (transcriptText) {
      callbacks.onInputTranscription?.(transcriptText);
    }
    callbacks.onClientEvent?.(
      'conversation.item.input_audio_transcription.completed',
      transcriptText || 'Input transcription completed.',
    );
  }

  if (isSpeechEventType(payload.type)) {
    callbacks.onSpeechObserved?.(payload.type);
    callbacks.onClientEvent?.(payload.type, payload.type);
  }

  if (payload.type === 'error') {
    const message = payload.error?.message ?? 'Realtime API returned an unknown error.';
    callbacks.onError?.(new Error(message));
    callbacks.onClientEvent?.('error', message);
  }

  if (eventType === 'system') {
    callbacks.onClientEvent?.('system', payload.type ?? 'unknown-event');
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const postSdpWithRetry = async (
  ephemeralApiKey: string,
  model: string,
  offerSdp: string,
): Promise<string> => {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(
        `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ephemeralApiKey}`,
            'Content-Type': 'application/sdp',
          },
          body: offerSdp,
        },
      );

      if (response.ok) {
        return await response.text();
      }

      const responseText = await response.text();
      const retriable = [408, 429, 500, 502, 503, 504].includes(response.status);
      lastError = new Error(
        `[AI] WebRTC SDP exchange failed (${response.status}): ${responseText}`,
      );

      if (!retriable || attempt === maxAttempts) {
        throw lastError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown SDP exchange error.';
      lastError = error instanceof Error ? error : new Error(message);

      if (attempt === maxAttempts) {
        throw lastError;
      }
    }

    await sleep(500 * attempt);
  }

  throw lastError ?? new Error('[AI] WebRTC SDP exchange failed.');
};

export const startAiRealtimeSession = async (
  callbacks: AiRealtimeCallbacks,
): Promise<AiRealtimeSessionHandle> => {
  const credentials = await fetchAiSessionCredentials();
  const localStream = await mediaDevices.getUserMedia({ audio: true, video: false });
  const peer = new RTCPeerConnection();
  const dataChannel = peer.createDataChannel('oai-events');
  const peerAny = peer as any;
  const dataChannelAny = dataChannel as any;

  localStream.getTracks().forEach((track) => {
    peer.addTrack(track, localStream);
  });

  let isClosed = false;
  let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const emit = (type: AiEventType, message: string) => {
    callbacks.onClientEvent?.(type, message);
  };

  const safeStop = async () => {
    if (isClosed) {
      return;
    }
    isClosed = true;

    try {
      if (dataChannel.readyState === 'open') {
        dataChannel.close();
      }
    } catch {
      // no-op
    }

    try {
      peer.getSenders().forEach((sender) => sender.track?.stop());
      localStream.getTracks().forEach((track) => track.stop());
      peer.close();
    } catch {
      // no-op
    }

    callbacks.onStopped?.();

    if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }
  };

  dataChannelAny.onopen = () => {
    callbacks.onConnected?.();
    emit('webrtc', 'Data channel opened.');
    sendSessionUpdate(dataChannel, callbacks, emit);
  };

  dataChannelAny.onmessage = (event: { data: unknown }) => {
    try {
      const payload = JSON.parse(String(event.data)) as RealtimeServerEvent;
      handleRealtimePayload(payload, callbacks);
    } catch {
      callbacks.onClientEvent?.('system', 'Failed to parse realtime event payload.');
    }
  };

  peerAny.onconnectionstatechange = () => {
    emit('webrtc', `Peer state: ${peer.connectionState}`);

    if (peer.connectionState === 'connected' && disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }

    if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
      callbacks.onError?.(new Error(`Peer connection ${peer.connectionState}.`));
    }

    if (peer.connectionState === 'disconnected') {
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
      }
      disconnectTimer = setTimeout(() => {
        if (peer.connectionState === 'disconnected') {
          callbacks.onError?.(new Error('Peer connection disconnected for too long.'));
        }
      }, 8000);
    }
  };

  const offer = await peer.createOffer({ offerToReceiveAudio: true });
  await peer.setLocalDescription(offer);

  const answerSdp = await postSdpWithRetry(
    credentials.ephemeralApiKey,
    credentials.model,
    offer.sdp ?? '',
  );
  await peer.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));

  emit('webrtc', 'Peer connection established.');

  return {
    stop: safeStop,
    nudge: () => {
      sendNudgeRequest(dataChannel, callbacks, emit);
    },
  };
};
