import { create } from 'zustand';
import { userRef } from '@utils/firebase';
import { type LanguageCode } from '../i18n';

interface SettingsState {
  language: LanguageCode;
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  biometricLock: boolean;
  seenSwipeHint: boolean;
  hydrated: boolean;
  layoutKey: number;

  hydrate: (uid: string) => Promise<void>;
  setLanguage: (uid: string, lang: LanguageCode) => Promise<void>;
  bumpLayoutKey: () => void;
  completeOnboarding: (uid: string) => Promise<void>;
  setNotificationsEnabled: (uid: string, enabled: boolean) => Promise<void>;
  setQuietHoursEnabled: (uid: string, enabled: boolean) => Promise<void>;
  setQuietHoursStart: (uid: string, time: string) => Promise<void>;
  setQuietHoursEnd: (uid: string, time: string) => Promise<void>;
  setBiometricLock: (uid: string, enabled: boolean) => Promise<void>;
  markSwipeHintSeen: () => void;
  reset: () => void;
}

const DEFAULTS = {
  language: 'fr' as LanguageCode,
  onboardingComplete: false,
  notificationsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  biometricLock: false,
  seenSwipeHint: false,
};

async function persist(uid: string, patch: Record<string, unknown>) {
  await userRef(uid).collection('account').doc('data').set(patch, { merge: true });
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULTS,
  hydrated: false,
  layoutKey: 0,

  hydrate: async (uid) => {
    const snap = await userRef(uid).collection('account').doc('data').get();
    const data = snap.data() ?? {};
    set({
      language: (data.language as LanguageCode) ?? DEFAULTS.language,
      onboardingComplete: data.onboardingComplete ?? false,
      notificationsEnabled: data.notificationsEnabled ?? true,
      quietHoursEnabled: data.quietHoursEnabled ?? false,
      quietHoursStart: data.quietHoursStart ?? '22:00',
      quietHoursEnd: data.quietHoursEnd ?? '07:00',
      biometricLock: data.biometricLock ?? false,
      seenSwipeHint: false,
      hydrated: true,
    });
  },

  setLanguage: async (uid, language) => {
    await persist(uid, { language });
    set({ language });
  },
  bumpLayoutKey: () => set((s) => ({ layoutKey: s.layoutKey + 1 })),
  completeOnboarding: async (uid) => {
    await persist(uid, { onboardingComplete: true });
    set({ onboardingComplete: true });
  },
  setNotificationsEnabled: async (uid, notificationsEnabled) => {
    await persist(uid, { notificationsEnabled });
    set({ notificationsEnabled });
  },
  setQuietHoursEnabled: async (uid, quietHoursEnabled) => {
    await persist(uid, { quietHoursEnabled });
    set({ quietHoursEnabled });
  },
  setQuietHoursStart: async (uid, quietHoursStart) => {
    await persist(uid, { quietHoursStart });
    set({ quietHoursStart });
  },
  setQuietHoursEnd: async (uid, quietHoursEnd) => {
    await persist(uid, { quietHoursEnd });
    set({ quietHoursEnd });
  },
  setBiometricLock: async (uid, biometricLock) => {
    await persist(uid, { biometricLock });
    set({ biometricLock });
  },
  markSwipeHintSeen: () => set({ seenSwipeHint: true }),
  reset: () => set({ ...DEFAULTS, hydrated: false, layoutKey: 0 }),
}));
