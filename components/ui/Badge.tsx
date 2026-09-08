import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Radius, Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';

import { AppText } from './AppText';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
}

const BG: Record<Variant, string> = {
  default: Colors.surfaceSubtle,
  success: Colors.successLight,
  warning: Colors.warningLight,
  danger: Colors.dangerLight,
  info: Colors.primaryLight,
};

const TEXT_COLOR: Record<Variant, string> = {
  default: Colors.textSecondary,
  success: Colors.successText,
  warning: Colors.warningText,
  danger: Colors.dangerText,
  info: Colors.primaryDark,
};

const VARIANT_ICON: Record<Variant, keyof typeof Ionicons.glyphMap> = {
  default: 'ellipse-outline',
  success: 'checkmark-circle',
  warning: 'time-outline',
  danger: 'alert-circle',
  info: 'ellipse-outline',
};

export function Badge({ label, variant = 'default', size = 'md', icon }: BadgeProps) {
  const iconName = icon ?? VARIANT_ICON[variant];
  const iconSize = size === 'sm' ? 10 : 12;
  const showIcon = variant !== 'default' && variant !== 'info';
  return (
    <View
      style={[styles.base, { backgroundColor: BG[variant] }, size === 'sm' ? styles.sm : styles.md]}
    >
      {showIcon && (
        <Ionicons
          name={iconName}
          size={iconSize}
          color={TEXT_COLOR[variant]}
          style={styles.icon}
        />
      )}
      <AppText
        style={[
          styles.text,
          { color: TEXT_COLOR[variant] },
          size === 'sm' ? styles.textSm : styles.textMd,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.sm, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' },
  sm: { paddingVertical: 2, paddingHorizontal: 8 },
  md: { paddingVertical: 4, paddingHorizontal: 10 },
  icon: { marginRight: 3 },
  text: { fontWeight: '600' },
  textSm: { fontSize: FontSize.xs },
  textMd: { fontSize: FontSize.sm },
});
