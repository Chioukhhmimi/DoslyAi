import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@store/settingsStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { Shadows } from '@constants/shadows';
import { AppText } from './AppText';
import { type LanguageCode } from '../../i18n';

const LANGS: { code: LanguageCode; flag: string; label: string }[] = [
  { code: 'ar', flag: '🇩🇿', label: 'عربي' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

interface LanguageSwitcherProps {
  style?: ViewStyle;
}

export function LanguageSwitcher({ style }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const language = useSettingsStore((s) => s.language);
  const setLanguageLocal = useSettingsStore((s) => s.setLanguageLocal);
  const bumpLayoutKey = useSettingsStore((s) => s.bumpLayoutKey);

  const current = LANGS.find((l) => l.code === language) ?? LANGS[1];

  function select(code: LanguageCode) {
    setOpen(false);
    if (code === language) return;
    setLanguageLocal(code);
    bumpLayoutKey();
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Select language"
      >
        <AppText style={styles.flag}>{current.flag}</AppText>
        <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            {LANGS.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.option}
                onPress={() => select(lang.code)}
                activeOpacity={0.7}
              >
                <AppText style={styles.optionFlag}>{lang.flag}</AppText>
                <AppText style={styles.optionLabel}>{lang.label}</AppText>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  flag: { fontSize: 18, lineHeight: 22 },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    minWidth: 160,
    ...Shadows.low,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  optionFlag: { fontSize: 18, lineHeight: 22 },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
