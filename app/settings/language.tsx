import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Card } from '@components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES, type LanguageCode } from '../../i18n';
import { useSettingsStore } from '@store/settingsStore';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  function changeLanguage(code: LanguageCode) {
    setLanguage(code);
    i18n.changeLanguage(code);
    I18nManager.forceRTL(RTL_LANGUAGES.includes(code));
  }

  return (
    <ScreenContainer>
      <ScreenHeader title={t('settings.language')} />
      <Card>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.row}
            onPress={() => changeLanguage(lang.code)}
            accessibilityRole="radio"
            accessibilityState={{ selected: i18n.language === lang.code }}
          >
            <View style={styles.langInfo}>
              <Text style={styles.native}>{lang.nativeLabel}</Text>
              <Text style={styles.label}>{lang.label}</Text>
            </View>
            {i18n.language === lang.code && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  langInfo: { flex: 1 },
  native: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
