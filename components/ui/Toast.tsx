import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
}

const BG: Record<ToastType, string> = {
  success: '#DCFCE7',
  error: '#FEE2E2',
  info: Colors.primaryLight,
};

const TEXT: Record<ToastType, string> = {
  success: '#15803D',
  error: '#B91C1C',
  info: Colors.primaryDark,
};

export function Toast({ message, type = 'info', visible, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: BG[type], transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={[styles.text, { color: TEXT[type] }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.md,
    right: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: '500',
    textAlign: 'center',
  },
});
