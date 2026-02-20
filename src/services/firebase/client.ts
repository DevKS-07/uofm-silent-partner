import firebase, { type ReactNativeFirebase } from '@react-native-firebase/app';
import {
  connectFirestoreEmulator,
  getFirestore as getFirestoreInstance,
  increment as firestoreIncrement,
  serverTimestamp as firestoreServerTimestamp,
  type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Platform } from 'react-native';

import { firebaseEnv } from './env';

type FirebaseRuntime = {
  app: ReactNativeFirebase.FirebaseApp;
  db: FirebaseFirestoreTypes.Module;
};

let runtime: FirebaseRuntime | null = null;
let emulatorsConfigured = false;

const resolveEmulatorHost = (host: string): string => {
  if (host !== 'localhost') {
    return host;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
};

const configureEmulators = (db: FirebaseFirestoreTypes.Module): void => {
  if (emulatorsConfigured) {
    return;
  }

  if (__DEV__ && firebaseEnv.EXPO_PUBLIC_USE_FIREBASE_EMULATORS) {
    connectFirestoreEmulator(
      db,
      resolveEmulatorHost(firebaseEnv.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST),
      firebaseEnv.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT,
    );
  }

  emulatorsConfigured = true;
};

const createRuntime = (): FirebaseRuntime => {
  const firebaseApp = firebase.app();
  const db = getFirestoreInstance(firebaseApp);

  configureEmulators(db);

  return { app: firebaseApp, db };
};

export const initializeFirebase = (): FirebaseRuntime | null => {
  if (Platform.OS === 'web') {
    return null;
  }

  if (runtime) {
    return runtime;
  }

  try {
    runtime = createRuntime();
    return runtime;
  } catch (error) {
    const message =
      '[Firebase] Native config missing. Add google-services files under secrets/firebase and run `npx expo prebuild`.';

    if (__DEV__) {
      console.warn(message, error);
      return null;
    }

    throw new Error(message);
  }
};

export const getFirestore = (): FirebaseFirestoreTypes.Module => {
  const currentRuntime = initializeFirebase();

  if (!currentRuntime) {
    throw new Error(
      '[Firebase] Firestore unavailable. Ensure native Firebase config is installed for iOS/Android builds.',
    );
  }

  return currentRuntime.db;
};

export const getFirebaseApp = (): ReactNativeFirebase.FirebaseApp => {
  const currentRuntime = initializeFirebase();

  if (!currentRuntime) {
    throw new Error(
      '[Firebase] Firebase app unavailable. Ensure native Firebase config is installed for iOS/Android builds.',
    );
  }

  return currentRuntime.app;
};

export const serverTimestamp = firestoreServerTimestamp;
export const increment = firestoreIncrement;
