// components/profile/AvatarPicker.tsx
import React from 'react';
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@components/ui/Avatar';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';

import { AppText } from '../ui/AppText';

interface AvatarPickerProps {
  name: string;
  uri?: string;
  onPicked: (uri: string) => void;
}

export function AvatarPicker({ name, uri, onPicked }: AvatarPickerProps) {
  const { t } = useTranslation();
  async function pick(source: 'camera' | 'library') {
    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('avatarPicker.permissionDenied'));
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('avatarPicker.permissionDenied'));
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    }
    if (!result.canceled && result.assets[0]?.uri) {
      onPicked(result.assets[0].uri);
    }
  }

  function showOptions() {
    Alert.alert(t('avatarPicker.title'), undefined, [
      { text: t('avatarPicker.camera'), onPress: () => pick('camera') },
      { text: t('avatarPicker.gallery'), onPress: () => pick('library') },
      { text: t('avatarPicker.cancel'), style: 'cancel' },
    ]);
  }

  return (
    <TouchableOpacity onPress={showOptions} style={styles.container} activeOpacity={0.8}>
      <Avatar name={name} uri={uri} size={80} />
      <AppText style={styles.label}>{t('profile.medical.edit')}</AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: Spacing.md },
  label: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4, fontWeight: '600' },
});
