import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useSettingsStore } from '@store/settingsStore';
import { useMedicationStore } from '@store/medicationStore';
import { useProfileStore } from '@store/profileStore';
import { useIsRTL } from '@hooks/useIsRTL';
import Constants from 'expo-constants';

interface SettingRowProps {
  label: string;
  route: string;
  icon?: string;
}

function SettingRow({ label, route, icon }: SettingRowProps) {
  const router = useRouter();
  const isRTL = useIsRTL();
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward';
  return (
    <TouchableOpacity style={styles.row} onPress={() => router.push(route as any)}>
      {icon && (
        <Ionicons
          name={icon as any}
          size={18}
          color={Colors.textSecondary}
          style={styles.rowIcon}
        />
      )}
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name={chevron} size={18} color={Colors.textDisabled} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const { biometricLock, setBiometricLock, reset: resetSettings } = useSettingsStore();
  const { reset: resetMedications } = useMedicationStore();
  const { profiles, activeProfileId, reset: resetProfiles } = useProfileStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  async function handleDeleteAll() {
    Alert.alert(
      t('settings.deleteAllTitle'),
      t('settings.deleteAllMessage'),
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await resetMedications();
            await resetProfiles();
            await resetSettings();
            router.replace('/(onboarding)/slide1');
          },
        },
      ],
    );
  }

  useEffect(() => {
    (async () => {
      const hw = await LocalAuthentication.hasHardwareAsync();
      const enr = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hw && enr);
    })();
  }, []);

  async function handleBiometricToggle(value: boolean) {
    if (value) {
      // Verify once before enabling so user can't lock themselves out
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('settings.biometric.label'),
        cancelLabel: t('common.cancel'),
      });
      if (!result.success) return;
    }
    setBiometricLock(value);
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <Card>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={18} color={Colors.textSecondary} style={styles.rowIcon} />
          <View style={styles.profileInfo}>
            <Text style={styles.rowLabel}>{t('profile.title')}</Text>
            <Text style={styles.profileSubtitle} numberOfLines={1}>
              {activeProfile ? activeProfile.name : t('profile.noProfiles')}
            </Text>
          </View>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={Colors.textDisabled} />
        </TouchableOpacity>
      </Card>

      <Card style={styles.section}>
        <SettingRow
          label={t('settings.language')}
          route="/settings/language"
          icon="language-outline"
        />
        <View style={styles.divider} />
        <SettingRow
          label={t('settings.notifications')}
          route="/settings/notifications"
          icon="notifications-outline"
        />
      </Card>

      {biometricAvailable && (
        <Card style={styles.section}>
          <View style={styles.row}>
            <Ionicons
              name="finger-print-outline"
              size={18}
              color={Colors.textSecondary}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>{t('settings.biometric.label')}</Text>
            <Switch
              value={biometricLock}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>
          <Text style={styles.biometricHint}>{t('settings.biometric.description')}</Text>
        </Card>
      )}

      <Card style={styles.section}>
        <SettingRow
          label={t('settings.privacy')}
          route="/settings/privacy"
          icon="shield-checkmark-outline"
        />
        <View style={styles.divider} />
        <SettingRow
          label={t('settings.terms')}
          route="/settings/terms"
          icon="document-text-outline"
        />
        <View style={styles.divider} />
        <SettingRow
          label={t('settings.about')}
          route="/settings/about"
          icon="information-circle-outline"
        />
      </Card>

      <Card style={styles.dangerCard}>
        <Button
          label={t('settings.deleteAllBtn')}
          onPress={handleDeleteAll}
          variant="danger"
        />
      </Card>

      <Text style={styles.version}>
        {t('settings.version')} {Constants.expoConfig?.version}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  section: { marginTop: Spacing.md },
  dangerCard: { marginTop: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.border },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowIcon: { marginRight: Spacing.sm },
  rowLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  profileInfo: { flex: 1 },
  profileSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  biometricHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    paddingBottom: Spacing.xs,
  },
  version: { textAlign: 'center', color: Colors.textDisabled, marginTop: Spacing.xl },
});
