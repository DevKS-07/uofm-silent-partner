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
  };

  dataChannelAny.onopen = () => {
    callbacks.onConnected?.();
    emit('webrtc', 'Data channel opened.');

    const sessionUpdate = {
      type: 'session.update',
      session: {
        type: 'realtime',
        instructions:
          'You are a silent social coach. Do not proactively respond. Listen continuously. Only produce output when the client explicitly sends response.create asking for a nudge.',
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
    if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
      callbacks.onError?.(new Error(`Peer connection ${peer.connectionState}.`));
    }
  };

  const offer = await peer.createOffer({ offerToReceiveAudio: true });
  await peer.setLocalDescription(offer);

  const response = await fetch(
    `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(credentials.model)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.ephemeralApiKey}`,
        'Content-Type': 'application/sdp',
      },
      body: offer.sdp ?? '',
    },
  );

  if (!response.ok) {
    const text = await response.text();
    await safeStop();
    throw new Error(`[AI] WebRTC SDP exchange failed (${response.status}): ${text}`);
  }

  const answerSdp = await response.text();
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
              'Give exactly one short line I can say next in this conversation. Keep it natural, specific, and under 18 words.',
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
