import { initialize, logHandledError } from '@embrace-io/react-native';
import { EmbraceNativeTracerProvider } from '@embrace-io/react-native-tracer-provider';
import { SpanStatusCode, trace } from '@opentelemetry/api';

const tracerProvider = new EmbraceNativeTracerProvider();
trace.setGlobalTracerProvider(tracerProvider);

const tracer = trace.getTracer('socialwingman');

let hasInitializedEmbrace = false;
let initializePromise: Promise<boolean> | null = null;

export const startEmbrace = async (): Promise<boolean> => {
  if (hasInitializedEmbrace) {
    return true;
  }

  if (!initializePromise) {
    initializePromise = initialize({
      sdkConfig: {
        ios: {
          appId: 'v5dj8',
        },
      },
    })
      .then((isStarted) => {
        hasInitializedEmbrace = isStarted;
        return isStarted;
      })
      .catch(() => false);
  }

  const isStarted = await initializePromise;

  if (!isStarted) {
    initializePromise = null;
  }

  return isStarted;
};

export const traceAISuggestion = async (block: () => Promise<void>): Promise<void> => {
  const isStarted = await startEmbrace();
  if (!isStarted) {
    await block();
    return;
  }

  const span = tracer.startSpan('generate-ai-suggestion');

  try {
    await block();
  } catch (error: unknown) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error) {
      void logHandledError(error, { flow: 'generate-ai-suggestion' });
    }

    throw error;
  } finally {
    span.end();
  }
};
