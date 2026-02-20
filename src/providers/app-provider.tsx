import { useEffect, type PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bootstrapAppServices } from '../services/app/bootstrap';
import { AuthProvider } from './auth-provider';
import { ThemeProvider } from './theme-provider';

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
