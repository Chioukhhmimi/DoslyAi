import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@store/authStore';
import { useIsRTL } from '@hooks/useIsRTL';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { AppText } from '@components/ui/AppText';
import { LanguageSwitcher } from '@components/ui/LanguageSwitcher';

export default function ForgotScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const { sendPasswordReset, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const textAlign = isRTL ? 'right' : 'left';

  async function handleReset() {
    if (!email.trim()) return;
    setLoading(true);
    const ok = await sendPasswordReset(email.trim().toLowerCase());
    setLoading(false);
    if (ok) setSent(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarSpacer} />
        <LanguageSwitcher />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.logoRow}>
            <Image source={require('../../assets/icon.png')} style={styles.logoIcon} />
            <AppText style={styles.logoText}>Dosly</AppText>
          </View>

          <AppText variant="h1" style={[styles.title, { textAlign }]}>
            {t('auth.forgotTitle')}
          </AppText>

          {sent ? (
            <View style={styles.successBox}>
              <AppText style={styles.successText}>{t('auth.resetPasswordSent')}</AppText>
            </View>
          ) : (
            <>
              {error ? (
                <View style={styles.errorBox}>
                  <AppText style={styles.errorText}>{t(error)}</AppText>
                </View>
              ) : null}

              <Input
                placeholder={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textAlign={textAlign}
              />

              <Button
                label={t('auth.sendResetLink')}
                onPress={handleReset}
                loading={loading}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  topBarSpacer: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logoIcon: { width: 40, height: 40, borderRadius: Radius.sm },
  logoText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.dangerText, fontSize: FontSize.sm },
  successBox: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  successText: { color: Colors.successText, fontSize: FontSize.md },
});
