import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Colors } from '@constants/colors';
import { FontSize } from '@constants/typography';

import { AppText } from '@components/ui/AppText';

export default function TermsScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('settings.terms')} />
      <AppText style={styles.body}>
        {t('settings.termsScreen.intro')}
        {'\n\n'}
        <AppText style={styles.bold}>{t('settings.termsScreen.section1Title')}</AppText>
        {'\n'}
        {t('settings.termsScreen.section1Body')}
        {'\n\n'}
        <AppText style={styles.bold}>{t('settings.termsScreen.section2Title')}</AppText>
        {'\n'}
        {t('settings.termsScreen.section2Body')}
        {'\n\n'}
        <AppText style={styles.bold}>{t('settings.termsScreen.section3Title')}</AppText>
        {'\n'}
        {t('settings.termsScreen.section3Body')}
        {'\n\n'}
        <AppText style={styles.bold}>{t('settings.termsScreen.section4Title')}</AppText>
        {'\n'}
        {t('settings.termsScreen.section4Body')}
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 26 },
  bold: { fontWeight: '700', color: Colors.textPrimary },
});
