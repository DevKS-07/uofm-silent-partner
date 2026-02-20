<!-- Steps for dev build -->

npx expo prebuild
npx expo run:android (or npx expo run:ios on macOS)
Optional for EAS cloud dev builds: npm i -D eas-cli then npx eas build --profile development --platform android
