import { useEffect, type PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bootstrapAppServices } from '../services/app/bootstrap';
import { AuthProvider } from './auth-provider';
import { ThemeProvider } from './theme-provider';

const installKeepAwakeUnhandledRejectionFilter = () => {
  const globalRef = globalThis as {
    __keepAwakeFilterInstalled__?: boolean;
    addEventListener?: (type: string, listener: (event: unknown) => void) => void;
  };

  if (globalRef.__keepAwakeFilterInstalled__) {
    return;
  }

  globalRef.__keepAwakeFilterInstalled__ = true;

  globalRef.addEventListener?.('unhandledrejection', (event: unknown) => {
    const rejectionEvent = event as { reason?: unknown; preventDefault?: () => void };
    const reason = rejectionEvent.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : '';

    if (message.includes('Unable to activate keep awake')) {
      rejectionEvent.preventDefault?.();
    }
  });
};

installKeepAwakeUnhandledRejectionFilter();

export const AppProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    bootstrapAppServices();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <StatusBar style="dark" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};
