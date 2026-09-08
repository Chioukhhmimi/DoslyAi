import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

import { AppText } from './AppText';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={48} color={Colors.primary} />
        </View>
        <AppText style={styles.title}>{t('common.appName')}</AppText>
        <AppText style={styles.subtitle}>{t('lock.subtitle')}</AppText>
        <TouchableOpacity style={styles.btn} onPress={onUnlock}>
          <Ionicons name="finger-print-outline" size={22} color="#fff" />
          <AppText style={styles.btnText}>{t('lock.unlock')}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  content: { alignItems: 'center', gap: Spacing.md },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  btnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
