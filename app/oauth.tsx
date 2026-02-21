import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function OAuthCallbackRoute() {
  const router = useRouter();

  useEffect(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  }, [router]);

  return null;
}
