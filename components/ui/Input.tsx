import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { AppText } from './AppText';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, style, rightElement, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, rightElement ? styles.inputWithRight : null, style]}
          placeholderTextColor={Colors.textDisabled}
          {...props}
        />
        {rightElement ? <View style={styles.rightSlot}>{rightElement}</View> : null}
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  inputRow: { position: 'relative' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  inputWithRight: { paddingRight: 44 },
  inputError: { borderColor: Colors.danger },
  rightSlot: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: { fontSize: FontSize.xs, color: Colors.danger, marginTop: Spacing.xs },
});
