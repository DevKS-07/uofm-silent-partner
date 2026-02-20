import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { getFirestore } from './client';

export const collectionRef = <T extends FirebaseFirestoreTypes.DocumentData>(
  path: string,
): FirebaseFirestoreTypes.CollectionReference<T> => {
  return getFirestore().collection<T>(path);
};

export const docRef = <T extends FirebaseFirestoreTypes.DocumentData>(
  path: string,
): FirebaseFirestoreTypes.DocumentReference<T> => {
  return getFirestore().doc<T>(path);
};
