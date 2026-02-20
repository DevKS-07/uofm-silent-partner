# Firebase Setup

This project uses `@react-native-firebase/app` + `@react-native-firebase/firestore` with native config files (best fit for Expo development builds).

## 1. Create Firebase Apps

1. In Firebase Console, create one iOS app and one Android app.
2. Use the same identifiers as `app.json`:
   - iOS bundle ID: `com.yourname.socialwingman`
   - Android package: `com.yourname.socialwingman`

## 2. Add Native Service Files

1. Download:
   - `GoogleService-Info.plist` (iOS)
   - `google-services.json` (Android)
2. Put them here:
   - `secrets/firebase/GoogleService-Info.plist`
   - `secrets/firebase/google-services.json`

These files are ignored by git.

## 3. Build Native Project

Run:

```bash
npx expo prebuild
```

Then run a development build:

```bash
npx expo run:android
# or
npx expo run:ios
```

## 4. Optional: Local Emulator

Copy `.env.example` to `.env` and set:

```bash
EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

Notes:
- On Android emulator, `localhost` is automatically rewritten to `10.0.2.2`.
- Emulator wiring is only enabled in `__DEV__`.

## 5. Usage

Import helpers from `src/firebase`:

```ts
import { collectionRef, docRef, getFirestore, serverTimestamp } from './src/firebase';
```

Firebase is initialized once at startup in `index.ts`.
