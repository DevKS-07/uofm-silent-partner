import { z } from 'zod';

const FirebaseEnvSchema = z.object({
  EXPO_PUBLIC_USE_FIREBASE_EMULATORS: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((value) => value === 'true'),
  EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: z.string().optional().default('127.0.0.1'),
  EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .optional()
    .default(8080),
});

export const firebaseEnv = FirebaseEnvSchema.parse({
  EXPO_PUBLIC_USE_FIREBASE_EMULATORS: process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS,
  EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST,
  EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT,
});
