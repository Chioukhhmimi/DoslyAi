import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Colors } from '@constants/colors';
import { FontSize } from '@constants/typography';

import { AppText } from '@components/ui/AppText';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('settings.privacy')} />
      <AppText style={styles.body}>{t('settings.privacyBody')}</AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 26 },
});
