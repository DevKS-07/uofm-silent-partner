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

    const sessionUpdate = {
      type: 'session.update',
      session: {
        type: 'realtime',
        instructions:
          'You are a silent social coach. Always use English only. Do not proactively respond. Listen continuously. ' +
          'Track tone, energy, and social dynamics (friendly, formal, playful, serious). ' +
          'Only produce output when the client explicitly sends response.create asking for a nudge.',
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

  dataChannelAny.onmessage = (event: { data: unknown }) => {
    try {
      const payload = JSON.parse(String(event.data)) as RealtimeServerEvent;
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

      if (
        payload.type === 'input_audio_buffer.speech_started' ||
        payload.type === 'input_audio_buffer.speech_stopped'
      ) {
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
      try {
        const createResponse = {
          type: 'response.create',
          response: {
            output_modalities: ['text'],
            instructions:
              'English only. You are coaching the device owner (me), not the other speaker. ' +
              'Output exactly one short line that I should say next, in first person voice, under 18 words. ' +
              'Mirror the current tone of the conversation: if playful, be witty; if serious, be respectful and grounded. ' +
              'Use light humor only when context supports it, never forced. ' +
              'Do not write the other person\'s reply. Do not add labels, quotes, or explanations.',
          },
        };
        dataChannelAny.send(JSON.stringify(createResponse));
        emit('system', 'Nudge requested.');
      } catch (error) {
        callbacks.onError?.(
          error instanceof Error ? error : new Error('Failed to request a nudge response.'),
        );
      }
    },
  };
};
