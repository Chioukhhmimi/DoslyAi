import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

import { AppText } from './AppText';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** 'pill' = rounded rectangle (default), 'circle' = fixed 36×36, 'rect' = Radius.sm rectangle */
  shape?: 'pill' | 'circle' | 'rect';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function SelectableChip({
  label,
  selected,
  onPress,
  shape = 'pill',
  size = 'md',
  style,
}: SelectableChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.base,
        selected && styles.selected,
        shape === 'pill' && size === 'md' && styles.pillMd,
        shape === 'pill' && size === 'sm' && styles.pillSm,
        shape === 'circle' && styles.circle,
        shape === 'rect' && styles.rect,
        style,
      ]}
    >
      <AppText style={[styles.label, selected && styles.labelSelected, size === 'sm' && styles.labelSm]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  pillSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    minHeight: 44,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  rect: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.textInverse,
  },
  labelSm: {
    fontSize: FontSize.xs,
  },
});
