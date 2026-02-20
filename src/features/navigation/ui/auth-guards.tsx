import { type PropsWithChildren } from 'react';
import { Redirect } from 'expo-router';

import { useAuth } from '../../../providers/auth-provider';

export const RequireAuth = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return <>{children}</>;
};

export const RequireGuest = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
};
