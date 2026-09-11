import '../i18n';
import 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { getDatabase } from '@db/database';
import { useProfileStore } from '@store/profileStore';
import { useMedicationStore } from '@store/medicationStore';
import { useSettingsStore } from '@store/settingsStore';
import { useAuthStore } from '@store/authStore';
import { useBiometric } from '@hooks/useBiometric';
import { LockScreen } from '@components/ui/LockScreen';
import { RTL_LANGUAGES } from '../i18n';
import { migrateLocalDataToFirestore } from '@utils/migrationService';
import { userRef } from '@utils/firebase';

SplashScreen.preventAutoHideAsync();

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  import('expo-notifications').then((N) => {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  });
}

function NavigationGate({ ready }: { ready: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const { status } = useAuthStore();
  const { onboardingComplete, hydrated: settingsHydrated } = useSettingsStore();
  const { profiles, hydrated: profilesHydrated } = useProfileStore();

  useEffect(() => {
    if (!ready) return;
    if (status === 'loading') return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const inProfile = segments[0] === 'profile';

    // For authenticated users, onboardingComplete defaults false until hydration —
    // wait for settings to load before deciding whether to show onboarding
    if (status === 'authenticated' && !settingsHydrated) return;

    // Onboarding first — no auth required
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/(onboarding)/slide1');
      return;
    }

    if (status === 'unauthenticated') {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    // Authenticated from here on
    if (inAuth || inOnboarding) {
      if (!settingsHydrated || !profilesHydrated) return;
      if (profiles.length === 0) {
        router.replace('/profile/new');
      } else {
        router.replace('/(tabs)');
      }
      return;
    }

    if (!settingsHydrated || !profilesHydrated) return;

    if (onboardingComplete && profiles.length === 0 && !inProfile) {
      router.replace('/profile/new');
    }
  }, [ready, status, onboardingComplete, profiles.length, settingsHydrated, profilesHydrated, segments]);

  return null;
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });
  const { locked, unlock } = useBiometric();
  const [pendingNotif, setPendingNotif] = useState<{
    medicationId: string;
    scheduledAt: string;
  } | null>(null);
  const router = useRouter();

  const authInitialize = useAuthStore((s) => s.initialize);
  const authStatus = useAuthStore((s) => s.status);
  const authUser = useAuthStore((s) => s.user);
  const isFirstLogin = useAuthStore((s) => s.isFirstLogin);

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateProfiles = useProfileStore((s) => s.hydrate);
  const hydrateMedications = useMedicationStore((s) => s.hydrate);
  const language = useSettingsStore((s) => s.language);
  const layoutKey = useSettingsStore((s) => s.layoutKey);
  const isRTL = RTL_LANGUAGES.includes(language);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractNotifData(response: any) {
    const data: Record<string, unknown> | undefined =
      response?.notification?.request?.content?.data;
    if (data?.medicationId) {
      setPendingNotif({
        medicationId: String(data.medicationId),
        scheduledAt: data.scheduledAt ? String(data.scheduledAt) : '',
      });
    }
  }

  useEffect(() => {
    async function init() {
      try {
        await getDatabase();
        const unsub = await authInitialize();
        unsubscribeRef.current = unsub;
      } catch (e) {
        console.error('Auth init failed', e);
      } finally {
        setReady(true);
      }

      if (!isExpoGo) {
        const N = await import('expo-notifications');
        const lastResponse = await N.getLastNotificationResponseAsync();
        if (lastResponse) extractNotifData(lastResponse);
      }
    }
    init();
    return () => { unsubscribeRef.current?.(); };
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !authUser) return;

    async function hydrateFromFirestore() {
      const uid = authUser!.uid;

      if (isFirstLogin) {
        try {
          await migrateLocalDataToFirestore(uid);
        } catch (e) {
          console.warn('Migration failed, will retry on next login', e);
        }
        // Sync local onboarding completion + language choice for new users
        const { onboardingComplete: localOnboarding, language: localLang } =
          useSettingsStore.getState();
        try {
          await userRef(uid)
            .collection('account')
            .doc('data')
            .set({ onboardingComplete: localOnboarding, language: localLang }, { merge: true });
        } catch (e) {
          console.warn('Failed to sync onboarding state to Firestore — user may see onboarding again on next cold start', e);
        }
      }

      await Promise.all([
        hydrateSettings(uid),
        hydrateProfiles(uid),
        hydrateMedications(uid),
      ]);
    }

    hydrateFromFirestore();
  }, [authStatus, authUser?.uid]);

  useEffect(() => {
    if (isExpoGo) return;
    let sub: { remove: () => void };
    import('expo-notifications').then((N) => {
      sub = N.addNotificationResponseReceivedListener(extractNotifData);
    });
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (ready && pendingNotif) {
      router.push({ pathname: '/medication/confirm', params: pendingNotif });
      setPendingNotif(null);
    }
  }, [ready, pendingNotif]);

  useEffect(() => {
    if (ready && fontsLoaded) SplashScreen.hideAsync();
  }, [ready, fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {locked && <LockScreen onUnlock={unlock} />}
        <NavigationGate ready={ready} />
        <Stack key={layoutKey} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="medication/confirm"
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="export" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
