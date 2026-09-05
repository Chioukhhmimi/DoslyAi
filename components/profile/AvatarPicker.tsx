// components/profile/AvatarPicker.tsx
import React from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '@components/ui/Avatar';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';

interface AvatarPickerProps {
  name: string;
  uri?: string;
  onPicked: (uri: string) => void;
}

export function AvatarPicker({ name, uri, onPicked }: AvatarPickerProps) {
  async function pick(source: 'camera' | 'library') {
    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    }
    if (!result.canceled && result.assets[0]?.uri) {
      onPicked(result.assets[0].uri);
    }
  }

  function showOptions() {
    Alert.alert('Photo de profil', undefined, [
      { text: 'Appareil photo', onPress: () => pick('camera') },
      { text: 'Galerie', onPress: () => pick('library') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  return (
    <TouchableOpacity onPress={showOptions} style={styles.container} activeOpacity={0.8}>
      <Avatar name={name} uri={uri} size={80} />
      <Text style={styles.label}>Modifier</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: Spacing.md },
  label:     { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4, fontWeight: '600' },
});
