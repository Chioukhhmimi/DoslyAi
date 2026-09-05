import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer>
      <ScreenHeader title={t('settings.about')} />
      <View style={styles.center}>
        <View style={styles.logo}>
          <Image source={require('@assets/icon.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.name}>{t('common.appName')}</Text>
        <Text style={styles.version}>
          {t('settings.version')} {Constants.expoConfig?.version}
        </Text>
        <Text style={styles.tagline}>{t('settings.aboutScreen.tagline')}</Text>
      </View>

      <View style={styles.infoBlock}>
        <InfoRow label={t('settings.aboutScreen.developer')} value="MedicalIT" />
        <InfoRow
          label={t('settings.aboutScreen.platform')}
          value={t('settings.aboutScreen.platformValue')}
        />
        <InfoRow
          label={t('settings.aboutScreen.database')}
          value={t('settings.aboutScreen.databaseValue')}
        />
        <InfoRow
          label={t('settings.aboutScreen.sharedData')}
          value={t('settings.aboutScreen.sharedDataValue')}
        />
      </View>
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600' },
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: Spacing.xl },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: 60, height: 60, borderRadius: 14 },
  name: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  version: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  infoBlock: { marginTop: Spacing.lg },
});
