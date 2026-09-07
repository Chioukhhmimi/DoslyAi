import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Colors } from '@constants/colors';
import { FontSize } from '@constants/typography';

export default function TermsScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('settings.terms')} />
      <Text style={styles.body}>
        {t('settings.termsScreen.intro')}
        {'\n\n'}
        <Text style={styles.bold}>{t('settings.termsScreen.section1Title')}</Text>
        {'\n'}
        {t('settings.termsScreen.section1Body')}
        {'\n\n'}
        <Text style={styles.bold}>{t('settings.termsScreen.section2Title')}</Text>
        {'\n'}
        {t('settings.termsScreen.section2Body')}
        {'\n\n'}
        <Text style={styles.bold}>{t('settings.termsScreen.section3Title')}</Text>
        {'\n'}
        {t('settings.termsScreen.section3Body')}
        {'\n\n'}
        <Text style={styles.bold}>{t('settings.termsScreen.section4Title')}</Text>
        {'\n'}
        {t('settings.termsScreen.section4Body')}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 26 },
  bold: { fontWeight: '700', color: Colors.textPrimary },
});
