export type AiConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'streaming'
  | 'stopping'
  | 'stopped'
  | 'error';

export type AiEventType =
  | 'system'
  | 'webrtc'
  | 'response.output_text.delta'
  | 'conversation.item.created'
  | 'conversation.item.input_audio_transcription.completed'
  | 'input_audio_buffer.speech_started'
  | 'input_audio_buffer.speech_stopped'
  | 'error';

export type AiClientEvent = {
  id: string;
  type: AiEventType;
  message: string;
  createdAt: string;
};

export type AiSessionCredentials = {
  ephemeralApiKey: string;
  expiresAt: number | null;
  model: string;
};

export type AiRealtimeCallbacks = {
  onConnected?: () => void;
  onStreaming?: () => void;
  onStopped?: () => void;
  onSpeechObserved?: (eventType: 'input_audio_buffer.speech_started' | 'input_audio_buffer.speech_stopped') => void;
  onTextDelta?: (delta: string) => void;
  onInputTranscription?: (text: string) => void;
  onConversationItem?: (text: string) => void;
  onClientEvent?: (type: AiEventType, message: string) => void;
  onError?: (error: Error) => void;
};

export type AiRealtimeSessionHandle = {
  stop: () => Promise<void>;
  nudge: () => void;
};
