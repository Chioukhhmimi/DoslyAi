import '../i18n';
import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { getDatabase } from '@db/database';
import { useProfileStore } from '@store/profileStore';
import { useMedicationStore } from '@store/medicationStore';
import { useSettingsStore } from '@store/settingsStore';
import { useBiometric } from '@hooks/useBiometric';
import { LockScreen } from '@components/ui/LockScreen';
import { RTL_LANGUAGES } from '../i18n';

SplashScreen.preventAutoHideAsync();

// expo-notifications crashes Expo Go on import (SDK 53+), so all usage is dynamic
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
  const { onboardingComplete, hydrated: settingsHydrated } = useSettingsStore();
  const { profiles, hydrated: profilesHydrated } = useProfileStore();

  useEffect(() => {
    if (!ready || !settingsHydrated || !profilesHydrated) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inProfile = segments[0] === 'profile';

    if (!onboardingComplete && !inOnboarding) {
      router.replace('/(onboarding)/slide1');
      return;
    }

    if (onboardingComplete && profiles.length === 0 && !inProfile && !inOnboarding) {
      router.replace('/profile/new');
    }
  }, [ready, onboardingComplete, profiles.length, settingsHydrated, profilesHydrated, segments]);

  return null;
}

export default function RootLayout() {
  const { i18n } = useTranslation();
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

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateProfiles = useProfileStore((s) => s.hydrate);
  const hydrateMedications = useMedicationStore((s) => s.hydrate);
  const language = useSettingsStore((s) => s.language);
  const layoutKey = useSettingsStore((s) => s.layoutKey);
  const isRTL = RTL_LANGUAGES.includes(language);

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
        await Promise.all([hydrateSettings(), hydrateProfiles(), hydrateMedications()]);
      } catch (e) {
        console.error('DB init failed', e);
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
  }, []);

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

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return (
    <GestureHandlerRootView style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {locked && <LockScreen onUnlock={unlock} />}
        <NavigationGate ready={ready} />
        <Stack key={layoutKey} screenOptions={{ headerShown: false }}>
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
