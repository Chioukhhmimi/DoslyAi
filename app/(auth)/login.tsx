import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const { signInWithEmail, signInWithGoogle, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const textAlign = isRTL ? 'right' : 'left';

  async function handleEmailLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);
    clearError();
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
    } catch (_) {
      // error surfaced via authStore.error
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    clearError();
    try {
      await signInWithGoogle();
    } catch (_) {
      // error surfaced via authStore.error
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <LanguageSwitcher />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoRow}>
            <Image source={require('../../assets/icon.png')} style={styles.logoIcon} />
            <AppText style={styles.logoText}>Dosly</AppText>
          </View>

          <AppText variant="h1" style={[styles.title, { textAlign }]}>
            {t('auth.loginTitle')}
          </AppText>
          <AppText variant="body" style={[styles.subtitle, { textAlign }]}>
            {t('auth.loginSubtitle', 'Connectez-vous pour continuer')}
          </AppText>

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

          <Input
            placeholder={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textAlign={textAlign}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.7}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot')}
          >
            <AppText style={styles.forgotText}>{t('auth.forgotPasswordLink')}</AppText>
          </TouchableOpacity>

          <Button
            label={t('auth.signIn')}
            onPress={handleEmailLogin}
            loading={loading}
            style={styles.btnSpacing}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <AppText style={styles.dividerText}>{t('auth.orDivider')}</AppText>
            <View style={styles.dividerLine} />
          </View>

          <Button
            label={t('auth.continueWithGoogle')}
            variant="secondary"
            onPress={handleGoogleLogin}
            loading={googleLoading}
            style={styles.btnSpacing}
          />

          <View style={styles.footerRow}>
            <AppText style={styles.footerText}>{t('auth.noAccount')} </AppText>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <AppText style={styles.linkText}>{t('auth.createLink')}</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  topBarSpacer: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
  },
  logoIcon: { width: 40, height: 40, borderRadius: Radius.sm },
  logoText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.dangerText, fontSize: FontSize.sm },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.md, marginTop: -Spacing.xs },
  forgotText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  btnSpacing: { marginBottom: Spacing.sm },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    marginHorizontal: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  linkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
});
