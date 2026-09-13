import { StyleSheet, TouchableOpacity, Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { AppText } from '@components/ui/AppText';
import { Colors } from '@constants/colors';
import { FontSize } from '@constants/typography';
import { Spacing, Radius } from '@constants/spacing';

const PRIVACY_URL = 'https://hmimi.design/dosly/privacy';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('settings.privacy')} />
      <AppText style={styles.body}>{t('settings.privacyBody')}</AppText>
      <TouchableOpacity
        style={styles.link}
        onPress={() => Linking.openURL(PRIVACY_URL)}
        activeOpacity={0.7}
        accessibilityRole="link"
        accessibilityLabel="Open full privacy policy"
      >
        <View style={styles.linkInner}>
          <AppText style={styles.linkText}>{t('settings.readFullPrivacy')}</AppText>
          <Ionicons name="open-outline" size={16} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 26, marginBottom: Spacing.lg },
  link: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  linkInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  linkText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
});
