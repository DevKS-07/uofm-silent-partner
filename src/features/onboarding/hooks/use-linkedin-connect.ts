import { useCallback, useState } from 'react';

import { useAuth } from '../../../providers/auth-provider';
import {
  connectLinkedInForUser,
  isLinkedInCancelledError,
  type LinkedInConnectionSummary,
} from '../../../services/linkedin';

type ConnectResult = {
  status: 'connected' | 'cancelled' | 'error';
  message?: string;
  profile?: LinkedInConnectionSummary;
};

export const useLinkedInConnect = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async (): Promise<ConnectResult> => {
    if (!user?.uid) {
      return { status: 'error', message: 'Session expired. Please sign in again.' };
    }

    setIsLoading(true);
    try {
      const profile = await connectLinkedInForUser(user.uid);
      return { status: 'connected', profile };
    } catch (error) {
      if (isLinkedInCancelledError(error)) {
        return { status: 'cancelled' };
      }

      const message = error instanceof Error ? error.message : 'LinkedIn connection failed.';
      return { status: 'error', message };
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  return {
    isLoading,
    connect,
  };
};
