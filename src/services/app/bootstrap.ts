import { initializeFirebase } from '../firebase';
import { startEmbrace } from '../observability';

let hasBootstrapped = false;

export const bootstrapAppServices = (): void => {
  if (hasBootstrapped) {
    return;
  }

  initializeFirebase();
  void startEmbrace();
  hasBootstrapped = true;
};
