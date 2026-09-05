import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';

interface SheetActionProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  variant?: 'default' | 'danger';
}

export function SheetAction({ label, icon, onPress, variant = 'default' }: SheetActionProps) {
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={icon}
        size={20}
        color={isDanger ? Colors.danger : Colors.textSecondary}
        style={styles.icon}
      />
      <Text style={[styles.label, isDanger && styles.labelDanger]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  icon: { width: 28 },
  label: { fontSize: FontSize.md, color: Colors.textPrimary },
  labelDanger: { color: Colors.danger },
});
