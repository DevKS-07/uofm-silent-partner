import {
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { Platform } from 'react-native';

import { getFirebaseApp } from '../firebase';
import { clearStoredAuthToken, persistAuthToken } from './token-store';
import { validateEmail, validateSignInPassword, validateSignUpPassword } from './validation';

export type AuthStateSnapshot = {
  user: FirebaseAuthTypes.User | null;
  token: string | null;
};

const getAuthClient = (): FirebaseAuthTypes.Module => {
  if (Platform.OS === 'web') {
    throw new Error('Native Firebase Auth is only available on iOS/Android builds.');
  }

  return getAuth(getFirebaseApp());
};

const toAuthError = (error: unknown): Error => {
  const code = (error as { code?: string } | undefined)?.code;

  switch (code) {
    case 'auth/email-already-in-use':
      return new Error('This email is already in use.');
    case 'auth/invalid-email':
      return new Error('Please enter a valid email address.');
    case 'auth/weak-password':
      return new Error('Password is too weak. Use at least 8 characters.');
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new Error('Invalid email or password.');
    case 'auth/too-many-requests':
      return new Error('Too many attempts. Please wait and try again.');
    default:
      return error instanceof Error ? error : new Error('Authentication failed.');
  }
};

export const subscribeToAuthState = (
  onState: (snapshot: AuthStateSnapshot) => void,
): (() => void) => {
  const auth = getAuthClient();

  return onIdTokenChanged(auth, (user) => {
    void (async () => {
      if (!user) {
        await clearStoredAuthToken();
        onState({ user: null, token: null });
        return;
      }

      const token = await getIdToken(user);
      await persistAuthToken(token);
      onState({ user, token });
    })();
  });
};

export const signUpWithEmailPassword = async (
  emailInput: string,
  passwordInput: string,
): Promise<void> => {
  const auth = getAuthClient();
  const email = validateEmail(emailInput).toLowerCase();
  const password = validateSignUpPassword(passwordInput);

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw toAuthError(error);
  }
};

export const signInWithEmailPassword = async (
  emailInput: string,
  passwordInput: string,
): Promise<void> => {
  const auth = getAuthClient();
  const email = validateEmail(emailInput).toLowerCase();
  const password = validateSignInPassword(passwordInput);

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw toAuthError(error);
  }
};

export const requestPasswordReset = async (emailInput: string): Promise<void> => {
  const auth = getAuthClient();
  const email = validateEmail(emailInput).toLowerCase();

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw toAuthError(error);
  }
};

export const signOutUser = async (): Promise<void> => {
  const auth = getAuthClient();

  try {
    await firebaseSignOut(auth);
  } finally {
    await clearStoredAuthToken();
  }
};
