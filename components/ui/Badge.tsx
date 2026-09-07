import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@constants/colors';
import { Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: Variant;
  size?: Size;
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

export function Badge({ label, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <View
      style={[styles.base, { backgroundColor: BG[variant] }, size === 'sm' ? styles.sm : styles.md]}
    >
      <Text
        style={[
          styles.text,
          { color: TEXT_COLOR[variant] },
          size === 'sm' ? styles.textSm : styles.textMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.sm, alignSelf: 'flex-start' },
  sm: { paddingVertical: 2, paddingHorizontal: 8 },
  md: { paddingVertical: 4, paddingHorizontal: 10 },
  text: { fontWeight: '600' },
  textSm: { fontSize: FontSize.xs },
  textMd: { fontSize: FontSize.sm },
});
