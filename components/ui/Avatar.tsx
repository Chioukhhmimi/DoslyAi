import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@constants/colors';

import { AppText } from './AppText';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  onPress?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

export function Avatar({ name, uri, size = 40, onPress }: AvatarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <AppText style={[styles.initials, { fontSize: size * 0.38 }]}>{getInitials(name)}</AppText>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
});
