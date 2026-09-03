import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@constants/colors';
import { Shadows } from '@constants/shadows';
import { Spacing, Radius } from '@constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadows.low,
  },
});
