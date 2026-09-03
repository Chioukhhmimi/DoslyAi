import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { Button } from '@components/ui/Button';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';

interface ErrorProps {
  error: Error;
  retry: () => void;
}

export default function ErrorScreen({ error, retry }: ErrorProps) {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>{t('common.error')}</Text>
        <Text style={styles.message}>{error.message}</Text>
        <Button label={t('common.retry')} onPress={retry} style={styles.button} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  title:     { fontSize: 20, fontWeight: '700', color: Colors.danger, marginBottom: Spacing.sm },
  message:   { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  button:    { width: 200 },
});
