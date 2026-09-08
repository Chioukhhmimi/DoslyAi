import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';

import { AppText } from '@components/ui/AppText';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: '404' }} />
      <View style={styles.container}>
        <AppText style={styles.title}>{t('notFound.title')}</AppText>
        <Link href="/(tabs)" style={styles.link}>
          {t('notFound.backHome')}
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  title: { fontSize: 20, color: Colors.textPrimary, marginBottom: Spacing.md },
  link: { color: Colors.primary, fontSize: 16 },
});
