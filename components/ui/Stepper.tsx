import React from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

import { AppText } from './AppText';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Show a TextInput (user can type) vs a plain Text display */
  editable?: boolean;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  editable = false,
}: StepperProps) {
  function decrement() {
    onChange(parseFloat(Math.max(min, value - step).toFixed(10)));
  }
  function increment() {
    onChange(parseFloat(Math.min(max, value + step).toFixed(10)));
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, styles.btnLeft]} onPress={decrement} disabled={value <= min} activeOpacity={0.7} accessibilityLabel="Decrease" accessibilityRole="button" accessibilityState={{ disabled: value <= min }}>
        <AppText style={[styles.btnText, value <= min && styles.btnDisabled]}>−</AppText>
      </TouchableOpacity>
      {editable ? (
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={(v) => {
            const n = parseFloat(v);
            if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          keyboardType="decimal-pad"
          textAlign="center"
          underlineColorAndroid="transparent"
          accessibilityLabel="Value"
        />
      ) : (
        <AppText style={styles.valueText}>{value}</AppText>
      )}
      <TouchableOpacity style={[styles.btn, styles.btnRight]} onPress={increment} disabled={value >= max} activeOpacity={0.7} accessibilityLabel="Increase" accessibilityRole="button" accessibilityState={{ disabled: value >= max }}>
        <AppText style={[styles.btnText, value >= max && styles.btnDisabled]}>+</AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  btn: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  btnLeft: {
    borderTopLeftRadius: Radius.sm - 1,
    borderBottomLeftRadius: Radius.sm - 1,
  },
  btnRight: {
    borderTopRightRadius: Radius.sm - 1,
    borderBottomRightRadius: Radius.sm - 1,
  },
  btnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.primary },
  btnDisabled: { color: Colors.textDisabled },
  input: {
    minWidth: 64,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  valueText: {
    minWidth: 64,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
