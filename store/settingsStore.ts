import { create } from 'zustand';
import { dbGetSetting, dbSetSetting } from '@db/models/settingsModel';
import { type LanguageCode } from '../i18n';

interface SettingsState {
  language: LanguageCode;
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;  // "HH:MM"
  quietHoursEnd: string;    // "HH:MM"
  biometricLock: boolean;
  hydrated: boolean;
  layoutKey: number;

  hydrate: () => Promise<void>;
  setLanguage: (lang: LanguageCode) => void;
  bumpLayoutKey: () => void;
  completeOnboarding: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setQuietHoursEnabled: (enabled: boolean) => void;
  setQuietHoursStart: (time: string) => void;
  setQuietHoursEnd: (time: string) => void;
  setBiometricLock: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'fr',
  onboardingComplete: false,
  notificationsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  biometricLock: false,
  hydrated: false,
  layoutKey: 0,

  hydrate: async () => {
    const [language, onboardingComplete, notificationsEnabled, quietHoursEnabled, quietHoursStart, quietHoursEnd, biometricLock] =
      await Promise.all([
        dbGetSetting('language'),
        dbGetSetting('onboardingComplete'),
        dbGetSetting('notificationsEnabled'),
        dbGetSetting('quietHoursEnabled'),
        dbGetSetting('quietHoursStart'),
        dbGetSetting('quietHoursEnd'),
        dbGetSetting('biometricLock'),
      ]);
    set({
      language: (language as LanguageCode) ?? 'fr',
      onboardingComplete: onboardingComplete === 'true',
      notificationsEnabled: notificationsEnabled !== 'false',
      quietHoursEnabled: quietHoursEnabled === 'true',
      quietHoursStart: quietHoursStart ?? '22:00',
      quietHoursEnd: quietHoursEnd ?? '07:00',
      biometricLock: biometricLock === 'true',
      hydrated: true,
    });
  },

  setLanguage: (language) => { dbSetSetting('language', language); set({ language }); },
  bumpLayoutKey: () => set((s) => ({ layoutKey: s.layoutKey + 1 })),
  completeOnboarding: () => { dbSetSetting('onboardingComplete', 'true'); set({ onboardingComplete: true }); },
  setNotificationsEnabled: (notificationsEnabled) => { dbSetSetting('notificationsEnabled', String(notificationsEnabled)); set({ notificationsEnabled }); },
  setQuietHoursEnabled: (quietHoursEnabled) => { dbSetSetting('quietHoursEnabled', String(quietHoursEnabled)); set({ quietHoursEnabled }); },
  setQuietHoursStart: (quietHoursStart) => { dbSetSetting('quietHoursStart', quietHoursStart); set({ quietHoursStart }); },
  setQuietHoursEnd: (quietHoursEnd) => { dbSetSetting('quietHoursEnd', quietHoursEnd); set({ quietHoursEnd }); },
  setBiometricLock: (biometricLock) => { dbSetSetting('biometricLock', String(biometricLock)); set({ biometricLock }); },
}));
