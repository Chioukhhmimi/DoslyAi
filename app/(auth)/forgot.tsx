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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/authStore';
import { useIsRTL } from '@hooks/useIsRTL';

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { textAlign }]}>{t('auth.forgotTitle')}</Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{t('auth.resetPasswordSent')}</Text>
          </View>
        ) : (
          <>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{t(error)}</Text>
              </View>
            ) : null}

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

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>{t('auth.sendResetLink')}</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  backBtn: { position: 'absolute', top: 60, left: 24 },
  backText: { fontSize: 22, color: '#374151' },
  title: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#111827',
    marginBottom: 24,
  },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: '#B91C1C', fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular' },
  successBox: { backgroundColor: '#D1FAE5', borderRadius: 8, padding: 16 },
  successText: { color: '#065F46', fontSize: 15, fontFamily: 'PlusJakartaSans_400Regular' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#111827',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' },
  disabled: { opacity: 0.6 },
});
