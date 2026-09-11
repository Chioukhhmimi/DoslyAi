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

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const { register, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const textAlign = isRTL ? 'right' : 'left';
  const displayError = localError ?? error;

  function validate(): boolean {
    if (!name.trim()) { setLocalError(t('auth.errors.nameRequired')); return false; }
    if (!email.trim()) { setLocalError(t('auth.errors.emailRequired')); return false; }
    if (password.length < 8) { setLocalError(t('auth.errors.weakPassword')); return false; }
    if (password !== confirm) { setLocalError(t('auth.errors.passwordMismatch')); return false; }
    return true;
  }

  async function handleRegister() {
    setLocalError(null);
    clearError();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, name.trim());
    } catch (_) {
      // error surfaced via authStore.error
    } finally {
      setLoading(false);
    }
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
            {t('auth.registerTitle')}
          </AppText>

          {displayError ? (
            <View style={styles.errorBox}>
              <AppText style={styles.errorText}>{displayError}</AppText>
            </View>
          ) : null}

          <Input
            placeholder={t('auth.name')}
            value={name}
            onChangeText={(v) => { setName(v); setLocalError(null); }}
            autoCapitalize="words"
            textAlign={textAlign}
          />

          <Input
            placeholder={t('auth.email')}
            value={email}
            onChangeText={(v) => { setEmail(v); setLocalError(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textAlign={textAlign}
          />

          <Input
            placeholder={t('auth.password')}
            value={password}
            onChangeText={(v) => { setPassword(v); setLocalError(null); }}
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

          <Input
            placeholder={t('auth.confirmPassword')}
            value={confirm}
            onChangeText={(v) => { setConfirm(v); setLocalError(null); }}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            textAlign={textAlign}
            rightElement={
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} activeOpacity={0.7}>
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          <Button
            label={t('auth.createAccount')}
            onPress={handleRegister}
            loading={loading}
            style={styles.btnSpacing}
          />

          <View style={styles.footerRow}>
            <AppText style={styles.footerText}>{t('auth.alreadyHaveAccount')} </AppText>
            <TouchableOpacity onPress={() => router.back()}>
              <AppText style={styles.linkText}>{t('auth.signInLink')}</AppText>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
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
    marginBottom: Spacing.md,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.dangerText, fontSize: FontSize.sm },
  btnSpacing: { marginTop: Spacing.xs, marginBottom: Spacing.md },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  footerText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  linkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
});
