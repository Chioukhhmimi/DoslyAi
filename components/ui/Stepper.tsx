import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

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
      <TouchableOpacity style={styles.btn} onPress={decrement} disabled={value <= min} activeOpacity={0.7}>
        <Text style={[styles.btnText, value <= min && styles.btnDisabled]}>−</Text>
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
        />
      ) : (
        <Text style={styles.valueText}>{value}</Text>
      )}
      <TouchableOpacity style={styles.btn} onPress={increment} disabled={value >= max} activeOpacity={0.7}>
        <Text style={[styles.btnText, value >= max && styles.btnDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    height: 48,
  },
  btn: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  btnText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.primary },
  btnDisabled: { color: Colors.textDisabled },
  input: {
    flex: 1,
    height: 48,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 48,
  },
});
