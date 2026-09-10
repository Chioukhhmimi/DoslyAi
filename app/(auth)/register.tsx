import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/authStore';
import { useIsRTL } from '@hooks/useIsRTL';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const { register, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
      // error set in authStore
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { textAlign }]}>{t('auth.registerTitle')}</Text>

        {displayError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, { textAlign }]}
          placeholder={t('auth.name')}
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={[styles.input, { textAlign }]}
          placeholder={t('auth.email')}
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={[styles.input, { textAlign }]}
          placeholder={t('auth.password')}
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { textAlign }]}
          placeholder={t('auth.confirmPassword')}
          placeholderTextColor="#9CA3AF"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>{t('auth.createAccount')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')} </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>{t('auth.signInLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 22, color: '#374151' },
  title: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#111827',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#B91C1C', fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#111827',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  disabled: { opacity: 0.6 },
  footerRow: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#6B7280', fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular' },
  linkText: { color: '#4F46E5', fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
});
