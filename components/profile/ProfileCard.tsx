import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Profile } from '@store/profileStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';

import { AppText } from '../ui/AppText';

interface ProfileCardProps {
  profile: Profile;
  isActive?: boolean;
  medicationCount?: number;
  onPress: () => void;
  onLongPress?: () => void;
}

function calcAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth + 'T00:00:00');
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function ProfileCard({
  profile,
  isActive,
  medicationCount,
  onPress,
  onLongPress,
}: ProfileCardProps) {
  const { t } = useTranslation();
  const age = calcAge(profile.dateOfBirth);
  const subtitle = [profile.relationship, age !== null ? `${age} ${t('profile.ageYears')}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={[styles.card, isActive && styles.cardActive]}
    >
      {isActive && <View style={styles.activeBorder} />}
      <Avatar name={profile.name} uri={profile.avatarUri} size={48} />
      <View style={styles.info}>
        <AppText style={styles.name}>{profile.name}</AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>
      {(medicationCount ?? 0) > 0 && (
        <Badge label={`${medicationCount} ${t('profile.medAbbrev')}`} variant="info" size="sm" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardActive: { borderColor: Colors.primary },
  activeBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
  },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
