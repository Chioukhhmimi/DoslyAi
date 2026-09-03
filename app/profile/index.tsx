import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { EmptyState } from '@components/ui/EmptyState';
import { PersonIllustration } from '@components/ui/EmptyIllustrations';
import { Avatar } from '@components/ui/Avatar';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useProfiles } from '@hooks/useProfiles';
import { useMedications } from '@hooks/useMedications';
import { useIsRTL } from '@hooks/useIsRTL';
import { Profile } from '@store/profileStore';

export default function ProfileListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profiles, activeProfile, setActiveProfile } = useProfiles();
  const { medications } = useMedications();

  function getMedCount(profileId: string) {
    return medications.filter((m) => m.profileId === profileId).length;
  }

  function handleSelect(profile: Profile) {
    setActiveProfile(profile.id);
    router.replace('/(tabs)');
  }

  const isRTL  = useIsRTL();
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward';

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        title={t('profile.title')}
        onBack={() => router.replace('/(tabs)')}
        right={
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/profile/new')}>
            <Ionicons name="add" size={20} color={Colors.primary} />
            <Text style={styles.addBtnText}>{t('profile.new')}</Text>
          </TouchableOpacity>
        }
      />

      {profiles.length === 0 ? (
        <EmptyState
          illustration={<PersonIllustration />}
          title={t('profile.noProfiles')}
          description={t('profile.noProfilesDescription')}
          actionLabel={t('profile.createFirst')}
          onAction={() => router.push('/profile/new')}
        />
      ) : (
        <>
          <Text style={styles.hint}>{t('profile.hint')}</Text>
          <FlatList
            data={profiles}
            keyExtractor={(p) => p.id}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isActive = item.id === activeProfile?.id;
              const count = getMedCount(item.id);
              return (
                <TouchableOpacity
                  style={[styles.card, isActive && styles.cardActive]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.75}
                >
                  <Avatar name={item.name} uri={item.avatarUri} size={48} />
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, isActive && styles.nameActive]}>{item.name}</Text>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>{t('profile.active')}</Text>
                        </View>
                      )}
                    </View>
                    {item.relationship ? <Text style={styles.rel}>{item.relationship}</Text> : null}
                    <Text style={styles.medCount}>{t('profile.medCount', { count })}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.detailBtn}
                    onPress={() => router.push(`/profile/${item.id}`)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name={chevron} size={20} color={Colors.textDisabled} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary },
  addBtnText:      { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  hint:            { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  card:            { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  cardActive:      { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  info:            { flex: 1 },
  nameRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  name:            { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  nameActive:      { color: Colors.primary },
  activeBadge:     { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  activeBadgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: '700' },
  rel:             { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  medCount:        { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  detailBtn:       { padding: 4 },
});
