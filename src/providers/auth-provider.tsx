import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { type FirebaseAuthTypes } from '@react-native-firebase/auth';

import {
  getStoredAuthToken,
  requestPasswordReset,
  signInWithEmailPassword,
  signOutUser,
  signUpWithEmailPassword,
  subscribeToAuthState,
} from '../services/auth';

type AuthContextValue = {
  user: FirebaseAuthTypes.User | null;
  token: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const savedToken = await getStoredAuthToken();
      setToken(savedToken);
    })();

    try {
      unsubscribe = subscribeToAuthState(({ user: nextUser, token: nextToken }) => {
        setUser(nextUser);
        setToken(nextToken);
        setIsReady(true);
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('[Auth] Auth subscription unavailable.', error);
      }

      setIsReady(true);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(user),
      signUp: signUpWithEmailPassword,
      signIn: signInWithEmailPassword,
      signOut: signOutUser,
      resetPassword: requestPasswordReset,
    }),
    [isReady, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
};
