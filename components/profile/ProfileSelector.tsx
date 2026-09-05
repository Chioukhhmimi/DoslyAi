import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Profile } from '@store/profileStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Avatar } from '@components/ui/Avatar';

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfileId: string | null;
  onSelect: (id: string) => void;
}

export function ProfileSelector({ profiles, activeProfileId, onSelect }: ProfileSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {profiles.map((p) => {
        const isActive = p.id === activeProfileId;
        return (
          <TouchableOpacity
            key={p.id}
            onPress={() => onSelect(p.id)}
            activeOpacity={0.8}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            accessibilityRole="button"
            accessibilityState={{ selected: p.id === activeProfileId }}
          >
            <Avatar name={p.name} uri={p.avatarUri} size={28} />
            <Text style={[styles.name, isActive ? styles.nameActive : styles.nameInactive]}>
              {p.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  pillInactive: { backgroundColor: 'transparent', borderColor: Colors.border },
  name: { fontSize: FontSize.sm, fontWeight: '600' },
  nameActive: { color: Colors.primaryDark },
  nameInactive: { color: Colors.textSecondary },
});
