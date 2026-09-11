import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSettingsStore } from '@store/settingsStore';

export function useBiometric() {
  const biometricLock = useSettingsStore((s) => s.biometricLock);
  const [locked, setLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const authenticating = useRef(false);

  async function authenticate() {
    if (authenticating.current) return;
    authenticating.current = true;

    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!compatible || !enrolled) {
      // Device has no biometric — unlock silently
      setLocked(false);
      authenticating.current = false;
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Déverrouillez Dosly',
      fallbackLabel: 'Utiliser le code',
      cancelLabel: 'Annuler',
      disableDeviceFallback: false,
    });

    setLocked(!result.success);
    authenticating.current = false;
  }

  useEffect(() => {
    if (!biometricLock) {
      setLocked(false);
      return;
    }

    // Lock on mount (cold start)
    setLocked(true);
    authenticate();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const wasBackground = appState.current === 'background' || appState.current === 'inactive';
      const nowActive = next === 'active';
      if (wasBackground && nowActive) {
        setLocked(true);
        authenticate();
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [biometricLock]);

  return { locked, unlock: authenticate };
}
