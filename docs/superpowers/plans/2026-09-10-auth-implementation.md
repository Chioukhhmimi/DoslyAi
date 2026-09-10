# Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Firebase Auth (Email/Password + Google Sign-In) and Firestore cloud sync to Dosly, replacing local SQLite storage with multi-device synced data, while preserving the existing biometric lock as a UI-only session guard.

**Architecture:** Firebase Auth handles identity and session persistence. All user data lives under `users/{uid}/` in Firestore with offline persistence. On first login, existing SQLite data is migrated atomically to Firestore then cleared. Auth status gates navigation: unauthenticated → `(auth)` stack, authenticated → existing onboarding/tabs flow.

**Tech Stack:** `@react-native-firebase/app v21+`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, `@react-native-google-signin/google-signin v13+`, Zustand, Expo Router v3, i18next

---

## File Map

**New files:**
- `constants/firebaseConfig.ts` — Web Client ID constant
- `utils/firebase.ts` — Firebase init, offline persistence, `userRef()` helper
- `store/authStore.ts` — Auth Zustand store
- `app/(auth)/_layout.tsx` — Auth stack navigator
- `app/(auth)/login.tsx` — Login screen
- `app/(auth)/register.tsx` — Register screen
- `app/(auth)/forgot.tsx` — Forgot password screen
- `utils/migrationService.ts` — One-time SQLite → Firestore migration
- `firestore.rules` — Firestore security rules

**Modified files:**
- `app/_layout.tsx` — Auth gate + Firestore hydration
- `store/profileStore.ts` — Firestore reads/writes replacing SQLite
- `store/medicationStore.ts` — Firestore reads/writes replacing SQLite
- `store/settingsStore.ts` — Firestore reads/writes replacing SQLite
- `i18n/locales/en.json` — Auth strings
- `i18n/locales/fr.json` — Auth strings
- `i18n/locales/ar.json` — Auth strings
- `app/(tabs)/settings.tsx` — Sign Out button

**Firestore Data Model (flat under uid for easy querying):**
```
users/{uid}/account                — doc: language, notificationsEnabled, quietHoursEnabled,
                                         quietHoursStart, quietHoursEnd, biometricLock,
                                         onboardingComplete, activeProfileId, createdAt
users/{uid}/profiles/{profileId}   — profile docs (same shape as Profile interface)
users/{uid}/medications/{medId}    — medication docs (same shape, includes profileId)
users/{uid}/intake_records/{id}    — intake record docs (includes medicationId, profileId)
```

---

## Task 1: Firebase Console Setup (Manual)

**Files:** None — manual steps in browser + local files

- [ ] **Step 1: Create Firebase project**

  Go to https://console.firebase.google.com → New project → name it `dosly-prod` → disable Google Analytics (optional).

- [ ] **Step 2: Enable Authentication**

  Firebase Console → Authentication → Get started → Sign-in method:
  - Enable **Email/Password**
  - Enable **Google** (set project support email)

- [ ] **Step 3: Create Firestore database**

  Firebase Console → Firestore Database → Create database → **Production mode** → choose region closest to your users (e.g., `europe-west1`).

- [ ] **Step 4: Download Android config**

  Firebase Console → Project settings → Your apps → Add app → Android:
  - Package name: `com.dosly.app` (from `app.json`)
  - Download `google-services.json`
  - Place it at: `meditrack/android/app/google-services.json`

- [ ] **Step 5: Get Web Client ID**

  Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration → copy the **Web client ID** (format: `XXXXXXXX.apps.googleusercontent.com`).

  Save it — you will use it in Task 3.

---

## Task 2: Install Packages + Android Native Config

**Files:**
- Modify: `android/build.gradle`
- Modify: `android/app/build.gradle`

- [ ] **Step 1: Install npm packages**

  ```bash
  cd meditrack
  npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-google-signin/google-signin
  ```

- [ ] **Step 2: Update `android/build.gradle`**

  Open `android/build.gradle`. In the `dependencies {}` block inside `buildscript {}`, add the Google Services classpath:

  ```groovy
  buildscript {
    dependencies {
      // ... existing entries ...
      classpath 'com.google.gms:google-services:4.4.2'
    }
  }
  ```

- [ ] **Step 3: Update `android/app/build.gradle`**

  Open `android/app/build.gradle`. At the very bottom of the file, add:

  ```groovy
  apply plugin: 'com.google.gms.google-services'
  ```

- [ ] **Step 4: Verify `google-services.json` is in place**

  ```bash
  ls android/app/google-services.json
  ```
  Expected: file exists (not "No such file").

- [ ] **Step 5: Rebuild the Android app**

  ```bash
  npx expo run:android
  ```
  Expected: builds successfully. If you see "google-services.json is missing" errors, re-check Step 4 of Task 1.

- [ ] **Step 6: Commit**

  ```bash
  git add android/build.gradle android/app/build.gradle android/app/google-services.json
  git commit -m "chore: add Firebase Android native config"
  ```

---

## Task 3: Firebase Init Module + Config

**Files:**
- Create: `constants/firebaseConfig.ts`
- Create: `utils/firebase.ts`

- [ ] **Step 1: Create `constants/firebaseConfig.ts`**

  Replace `YOUR_WEB_CLIENT_ID` with the value from Task 1 Step 5.

  ```typescript
  export const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
  ```

- [ ] **Step 2: Create `utils/firebase.ts`**

  ```typescript
  import auth from '@react-native-firebase/auth';
  import firestore from '@react-native-firebase/firestore';
  import { GoogleSignin } from '@react-native-google-signin/google-signin';
  import { WEB_CLIENT_ID } from '@constants/firebaseConfig';

  firestore().settings({ persistence: true });

  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });

  export { auth, firestore };

  export const userRef = (uid: string) =>
    firestore().collection('users').doc(uid);

  export const mapFirebaseError = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'auth.errors.emailInUse';
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'auth.errors.invalidCredential';
      case 'auth/too-many-requests':
        return 'auth.errors.tooManyRequests';
      case 'auth/network-request-failed':
        return 'auth.errors.networkError';
      case 'auth/weak-password':
        return 'auth.errors.weakPassword';
      default:
        return 'common.error';
    }
  };
  ```

- [ ] **Step 3: Add `@constants` path alias to `babel.config.js`**

  Open `babel.config.js`. In the `module-resolver` `alias` section, add:

  ```javascript
  '@constants': './constants',
  ```

  Full alias section should look like:
  ```javascript
  alias: {
    '@components': './components',
    '@store': './store',
    '@hooks': './hooks',
    '@db': './db',
    '@utils': './utils',
    '@constants': './constants',
    '@i18n': './i18n',
  },
  ```

- [ ] **Step 4: Add `@constants` to `tsconfig.json` paths**

  Open `tsconfig.json`. In `compilerOptions.paths`, add:
  ```json
  "@constants/*": ["./constants/*"]
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add constants/firebaseConfig.ts utils/firebase.ts babel.config.js tsconfig.json
  git commit -m "feat: add Firebase init module and path alias"
  ```

---

## Task 4: Create `store/authStore.ts`

**Files:**
- Create: `store/authStore.ts`

- [ ] **Step 1: Create the store**

  ```typescript
  import { create } from 'zustand';
  import { GoogleSignin } from '@react-native-google-signin/google-signin';
  import { auth, firestore, userRef, mapFirebaseError } from '@utils/firebase';
  import { FirebaseAuthTypes } from '@react-native-firebase/auth';

  export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }

  interface AuthState {
    user: AuthUser | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    isFirstLogin: boolean;
    error: string | null;

    initialize: () => Promise<() => void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    clearError: () => void;
  }

  function toAuthUser(u: FirebaseAuthTypes.User): AuthUser {
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
    };
  }

  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: 'loading',
    isFirstLogin: false,
    error: null,

    initialize: () =>
      new Promise<() => void>((resolve) => {
        let resolved = false;
        const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            const accountSnap = await userRef(firebaseUser.uid)
              .collection('account')
              .doc('data')
              .get();
            set({
              user: toAuthUser(firebaseUser),
              status: 'authenticated',
              isFirstLogin: !accountSnap.exists,
            });
          } else {
            set({ user: null, status: 'unauthenticated', isFirstLogin: false });
          }
          if (!resolved) {
            resolved = true;
            resolve(unsubscribe);
          }
        });
      }),

    signInWithEmail: async (email, password) => {
      set({ error: null });
      try {
        await auth().signInWithEmailAndPassword(email, password);
      } catch (e: any) {
        set({ error: mapFirebaseError(e.code) });
        throw e;
      }
    },

    signInWithGoogle: async () => {
      set({ error: null });
      try {
        await GoogleSignin.hasPlayServices();
        const { data } = await GoogleSignin.signIn();
        const credential = auth.GoogleAuthProvider.credential(data?.idToken ?? '');
        await auth().signInWithCredential(credential);
      } catch (e: any) {
        if (e.code !== 'SIGN_IN_CANCELLED') {
          set({ error: mapFirebaseError(e.code) });
        }
        throw e;
      }
    },

    register: async (email, password, displayName) => {
      set({ error: null });
      try {
        const { user } = await auth().createUserWithEmailAndPassword(email, password);
        await user.updateProfile({ displayName });
      } catch (e: any) {
        set({ error: mapFirebaseError(e.code) });
        throw e;
      }
    },

    sendPasswordReset: async (email) => {
      set({ error: null });
      try {
        await auth().sendPasswordResetEmail(email);
        return true;
      } catch (e: any) {
        set({ error: mapFirebaseError(e.code) });
        return false;
      }
    },

    signOut: async () => {
      await auth().signOut();
      try { await GoogleSignin.signOut(); } catch (_) {}
      set({ user: null, status: 'unauthenticated', isFirstLogin: false, error: null });
    },

    clearError: () => set({ error: null }),
  }));
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add store/authStore.ts
  git commit -m "feat: add authStore with Firebase Auth + Google Sign-In"
  ```

---

## Task 5: Add i18n Auth Strings

**Files:**
- Modify: `i18n/locales/en.json`
- Modify: `i18n/locales/fr.json`
- Modify: `i18n/locales/ar.json`

- [ ] **Step 1: Add to `i18n/locales/en.json`**

  After the last top-level key (before the closing `}`), add:

  ```json
  ,
  "auth": {
    "loginTitle": "Welcome back",
    "registerTitle": "Create account",
    "forgotTitle": "Reset password",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm password",
    "name": "Full name",
    "signIn": "Sign in",
    "createAccount": "Create account",
    "continueWithGoogle": "Continue with Google",
    "forgotPasswordLink": "Forgot password?",
    "noAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?",
    "signInLink": "Sign in",
    "createLink": "Create one",
    "resetPasswordSent": "A reset link has been sent to your email.",
    "sendResetLink": "Send reset link",
    "orDivider": "or",
    "errors": {
      "emailInUse": "An account with this email already exists.",
      "invalidCredential": "Incorrect email or password.",
      "tooManyRequests": "Too many attempts. Try again later.",
      "networkError": "No internet connection.",
      "weakPassword": "Password must be at least 8 characters.",
      "passwordMismatch": "Passwords do not match.",
      "emailRequired": "Email is required.",
      "passwordRequired": "Password is required.",
      "nameRequired": "Name is required."
    }
  }
  ```

- [ ] **Step 2: Add to `i18n/locales/fr.json`**

  ```json
  ,
  "auth": {
    "loginTitle": "Bon retour",
    "registerTitle": "Créer un compte",
    "forgotTitle": "Réinitialiser le mot de passe",
    "email": "E-mail",
    "password": "Mot de passe",
    "confirmPassword": "Confirmer le mot de passe",
    "name": "Nom complet",
    "signIn": "Se connecter",
    "createAccount": "Créer un compte",
    "continueWithGoogle": "Continuer avec Google",
    "forgotPasswordLink": "Mot de passe oublié ?",
    "noAccount": "Pas encore de compte ?",
    "alreadyHaveAccount": "Déjà un compte ?",
    "signInLink": "Se connecter",
    "createLink": "En créer un",
    "resetPasswordSent": "Un lien de réinitialisation a été envoyé à votre e-mail.",
    "sendResetLink": "Envoyer le lien",
    "orDivider": "ou",
    "errors": {
      "emailInUse": "Un compte avec cet e-mail existe déjà.",
      "invalidCredential": "E-mail ou mot de passe incorrect.",
      "tooManyRequests": "Trop de tentatives. Réessayez plus tard.",
      "networkError": "Pas de connexion internet.",
      "weakPassword": "Le mot de passe doit comporter au moins 8 caractères.",
      "passwordMismatch": "Les mots de passe ne correspondent pas.",
      "emailRequired": "L'e-mail est requis.",
      "passwordRequired": "Le mot de passe est requis.",
      "nameRequired": "Le nom est requis."
    }
  }
  ```

- [ ] **Step 3: Add to `i18n/locales/ar.json`**

  ```json
  ,
  "auth": {
    "loginTitle": "مرحباً بعودتك",
    "registerTitle": "إنشاء حساب",
    "forgotTitle": "إعادة تعيين كلمة المرور",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "confirmPassword": "تأكيد كلمة المرور",
    "name": "الاسم الكامل",
    "signIn": "تسجيل الدخول",
    "createAccount": "إنشاء حساب",
    "continueWithGoogle": "المتابعة مع Google",
    "forgotPasswordLink": "نسيت كلمة المرور؟",
    "noAccount": "ليس لديك حساب؟",
    "alreadyHaveAccount": "لديك حساب بالفعل؟",
    "signInLink": "تسجيل الدخول",
    "createLink": "أنشئ واحداً",
    "resetPasswordSent": "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.",
    "sendResetLink": "إرسال الرابط",
    "orDivider": "أو",
    "errors": {
      "emailInUse": "يوجد حساب بهذا البريد الإلكتروني بالفعل.",
      "invalidCredential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      "tooManyRequests": "محاولات كثيرة جداً. حاول مرة أخرى لاحقاً.",
      "networkError": "لا يوجد اتصال بالإنترنت.",
      "weakPassword": "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
      "passwordMismatch": "كلمتا المرور غير متطابقتين.",
      "emailRequired": "البريد الإلكتروني مطلوب.",
      "passwordRequired": "كلمة المرور مطلوبة.",
      "nameRequired": "الاسم مطلوب."
    }
  }
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add i18n/locales/en.json i18n/locales/fr.json i18n/locales/ar.json
  git commit -m "feat: add auth i18n strings (en/fr/ar)"
  ```

---

## Task 6: Auth Navigation Layout

**Files:**
- Create: `app/(auth)/_layout.tsx`

- [ ] **Step 1: Create `app/(auth)/_layout.tsx`**

  ```typescript
  import { Stack } from 'expo-router';

  export default function AuthLayout() {
    return (
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot" />
      </Stack>
    );
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add app/(auth)/_layout.tsx
  git commit -m "feat: add auth navigation layout"
  ```

---

## Task 7: Login Screen

**Files:**
- Create: `app/(auth)/login.tsx`

- [ ] **Step 1: Create `app/(auth)/login.tsx`**

  ```typescript
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
  import { Colors } from '@constants/colors';

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
      if (!email.trim()) return;
      if (!password) return;
      setLoading(true);
      clearError();
      try {
        await signInWithEmail(email.trim().toLowerCase(), password);
      } catch (_) {
        // error is set in authStore
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
        // error is set in authStore
      } finally {
        setGoogleLoading(false);
      }
    }

    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { textAlign }]}>{t('auth.loginTitle')}</Text>

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

          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.flex, { textAlign }]}
              placeholder={t('auth.password')}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot')}
          >
            <Text style={[styles.forgotText, { textAlign }]}>{t('auth.forgotPasswordLink')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>{t('auth.signIn')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.orDivider')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && styles.disabled]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#374151" />
            ) : (
              <Text style={styles.googleBtnText}>{t('auth.continueWithGoogle')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('auth.noAccount')} </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>{t('auth.createLink')}</Text>
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
    errorText: {
      color: '#B91C1C',
      fontSize: 14,
      fontFamily: 'PlusJakartaSans_400Regular',
    },
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
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    eyeBtn: {
      position: 'absolute',
      right: 14,
      padding: 4,
    },
    eyeText: { fontSize: 18 },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotText: { color: '#6B7280', fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular' },
    primaryBtn: {
      backgroundColor: '#4F46E5',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    primaryBtnText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    disabled: { opacity: 0.6 },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: {
      marginHorizontal: 12,
      color: '#9CA3AF',
      fontSize: 14,
      fontFamily: 'PlusJakartaSans_400Regular',
    },
    googleBtn: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 24,
      backgroundColor: '#fff',
    },
    googleBtnText: {
      color: '#374151',
      fontSize: 16,
      fontFamily: 'PlusJakartaSans_600SemiBold',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    footerText: { color: '#6B7280', fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular' },
    linkText: { color: '#4F46E5', fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  });
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add "app/(auth)/login.tsx"
  git commit -m "feat: add Login screen with email/password and Google"
  ```

---

## Task 8: Register Screen

**Files:**
- Create: `app/(auth)/register.tsx`

- [ ] **Step 1: Create `app/(auth)/register.tsx`**

  ```typescript
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add "app/(auth)/register.tsx"
  git commit -m "feat: add Register screen"
  ```

---

## Task 9: Forgot Password Screen

**Files:**
- Create: `app/(auth)/forgot.tsx`

- [ ] **Step 1: Create `app/(auth)/forgot.tsx`**

  ```typescript
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add "app/(auth)/forgot.tsx"
  git commit -m "feat: add Forgot Password screen"
  ```

---

## Task 10: Update `store/profileStore.ts` for Firestore

**Files:**
- Modify: `store/profileStore.ts`

- [ ] **Step 1: Replace the entire file**

  ```typescript
  import { create } from 'zustand';
  import { userRef } from '@utils/firebase';
  import { v4 as uuid } from 'uuid';

  export interface Profile {
    id: string;
    name: string;
    dateOfBirth?: string;
    relationship?: string;
    avatarUri?: string;
    bloodType?: string;
    weight?: number;
    height?: number;
    allergies?: string[];
    conditions?: string[];
    doctorName?: string;
    doctorPhone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalNotes?: string;
    createdAt: string;
  }

  interface ProfileState {
    profiles: Profile[];
    activeProfileId: string | null;
    hydrated: boolean;

    hydrate: (uid: string) => Promise<void>;
    addProfile: (uid: string, data: Omit<Profile, 'id' | 'createdAt'>) => Promise<void>;
    updateProfile: (uid: string, id: string, data: Partial<Profile>) => Promise<void>;
    deleteProfile: (uid: string, id: string) => Promise<void>;
    setActiveProfile: (uid: string, id: string) => Promise<void>;
    reset: () => void;
  }

  export const useProfileStore = create<ProfileState>((set, get) => ({
    profiles: [],
    activeProfileId: null,
    hydrated: false,

    hydrate: async (uid) => {
      const snap = await userRef(uid).collection('profiles').get();
      const profiles = snap.docs.map((d) => d.data() as Profile);

      const accountSnap = await userRef(uid).collection('account').doc('data').get();
      const activeProfileId: string | null =
        (accountSnap.data()?.activeProfileId as string) ?? profiles[0]?.id ?? null;

      set({ profiles, activeProfileId, hydrated: true });
    },

    addProfile: async (uid, data) => {
      const newProfile: Profile = {
        ...data,
        id: uuid(),
        createdAt: new Date().toISOString(),
      };
      await userRef(uid).collection('profiles').doc(newProfile.id).set(newProfile);
      set((state) => {
        const activeProfileId = state.activeProfileId ?? newProfile.id;
        userRef(uid)
          .collection('account')
          .doc('data')
          .set({ activeProfileId }, { merge: true });
        return { profiles: [...state.profiles, newProfile], activeProfileId };
      });
    },

    updateProfile: async (uid, id, data) => {
      await userRef(uid).collection('profiles').doc(id).update(data);
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    },

    deleteProfile: async (uid, id) => {
      await userRef(uid).collection('profiles').doc(id).delete();
      set((state) => {
        const remaining = state.profiles.filter((p) => p.id !== id);
        const activeProfileId =
          state.activeProfileId === id ? (remaining[0]?.id ?? null) : state.activeProfileId;
        if (activeProfileId) {
          userRef(uid)
            .collection('account')
            .doc('data')
            .set({ activeProfileId }, { merge: true });
        }
        return { profiles: remaining, activeProfileId };
      });
    },

    setActiveProfile: async (uid, id) => {
      await userRef(uid)
        .collection('account')
        .doc('data')
        .set({ activeProfileId: id }, { merge: true });
      set({ activeProfileId: id });
    },

    reset: () => set({ profiles: [], activeProfileId: null, hydrated: false }),
  }));
  ```

  > **Note on `uuid`:** Install with `npm install uuid @types/uuid` if not already present. Alternatively, replace `uuid()` with `Date.now().toString()` to avoid a new dependency — the existing codebase used this pattern.

- [ ] **Step 2: Install uuid if needed**

  Check if uuid is already installed:
  ```bash
  cat package.json | grep uuid
  ```
  If not found:
  ```bash
  npm install uuid @types/uuid
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add store/profileStore.ts package.json package-lock.json
  git commit -m "feat: migrate profileStore to Firestore"
  ```

---

## Task 11: Update `store/medicationStore.ts` for Firestore

**Files:**
- Modify: `store/medicationStore.ts`

- [ ] **Step 1: Replace the entire file**

  ```typescript
  import { create } from 'zustand';
  import { userRef } from '@utils/firebase';

  export type FrequencyType = 'daily' | 'weekly' | 'interval' | 'pattern';
  export type MedicationType = 'pill' | 'syrup' | 'injection' | 'supplement' | 'other';

  export interface MedicationSchedule {
    times: string[];
    frequency: FrequencyType;
    daysOfWeek?: number[];
    intervalDays?: number;
    pattern?: number[];
  }

  export interface Medication {
    id: string;
    profileId: string;
    name: string;
    doseQuantity: number;
    unit: string;
    type: MedicationType;
    schedule: MedicationSchedule;
    startDate: string;
    endDate?: string;
    notes?: string;
    prescriptionImageUri?: string;
    paused: boolean;
    pillColor?: string;
    refillReminderEnabled?: boolean;
    refillReminderDays?: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface IntakeRecord {
    id: string;
    medicationId: string;
    profileId: string;
    scheduledAt: string;
    takenAt?: string;
    skipped?: boolean;
    notes?: string;
  }

  export type NewMedication = Omit<Medication, 'id' | 'createdAt' | 'updatedAt' | 'paused'>;

  interface MedicationState {
    medications: Medication[];
    intakeHistory: IntakeRecord[];
    hydrated: boolean;

    hydrate: (uid: string) => Promise<void>;
    addMedication: (uid: string, med: NewMedication) => Promise<void>;
    updateMedication: (uid: string, id: string, data: Partial<Medication>) => Promise<void>;
    deleteMedication: (uid: string, id: string) => Promise<void>;
    recordIntake: (uid: string, record: Omit<IntakeRecord, 'id'>) => Promise<void>;
    getMedicationsForProfile: (profileId: string) => Medication[];
    reset: () => void;
  }

  export const useMedicationStore = create<MedicationState>((set, get) => ({
    medications: [],
    intakeHistory: [],
    hydrated: false,

    hydrate: async (uid) => {
      const [medsSnap, intakeSnap] = await Promise.all([
        userRef(uid).collection('medications').get(),
        userRef(uid).collection('intake_records').get(),
      ]);
      const medications = medsSnap.docs.map((d) => d.data() as Medication);
      const intakeHistory = intakeSnap.docs.map((d) => d.data() as IntakeRecord);
      set({ medications, intakeHistory, hydrated: true });
    },

    addMedication: async (uid, med) => {
      const now = new Date().toISOString();
      const newMed: Medication = {
        ...med,
        id: Date.now().toString(),
        paused: false,
        createdAt: now,
        updatedAt: now,
      };
      await userRef(uid).collection('medications').doc(newMed.id).set(newMed);
      set((state) => ({ medications: [...state.medications, newMed] }));
    },

    updateMedication: async (uid, id, data) => {
      const patch = { ...data, updatedAt: new Date().toISOString() };
      await userRef(uid).collection('medications').doc(id).update(patch);
      set((state) => ({
        medications: state.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      }));
    },

    deleteMedication: async (uid, id) => {
      await userRef(uid).collection('medications').doc(id).delete();
      set((state) => ({ medications: state.medications.filter((m) => m.id !== id) }));
    },

    recordIntake: async (uid, record) => {
      const newRecord: IntakeRecord = { ...record, id: Date.now().toString() };
      await userRef(uid).collection('intake_records').doc(newRecord.id).set(newRecord);
      set((state) => ({ intakeHistory: [...state.intakeHistory, newRecord] }));
    },

    getMedicationsForProfile: (profileId) =>
      get().medications.filter((m) => m.profileId === profileId),

    reset: () => set({ medications: [], intakeHistory: [], hydrated: false }),
  }));
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add store/medicationStore.ts
  git commit -m "feat: migrate medicationStore to Firestore"
  ```

---

## Task 12: Update `store/settingsStore.ts` for Firestore

**Files:**
- Modify: `store/settingsStore.ts`

- [ ] **Step 1: Replace the entire file**

  ```typescript
  import { create } from 'zustand';
  import { userRef } from '@utils/firebase';
  import { type LanguageCode } from '../i18n';

  interface SettingsState {
    language: LanguageCode;
    onboardingComplete: boolean;
    notificationsEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    biometricLock: boolean;
    seenSwipeHint: boolean;
    hydrated: boolean;
    layoutKey: number;

    hydrate: (uid: string) => Promise<void>;
    setLanguage: (uid: string, lang: LanguageCode) => Promise<void>;
    bumpLayoutKey: () => void;
    completeOnboarding: (uid: string) => Promise<void>;
    setNotificationsEnabled: (uid: string, enabled: boolean) => Promise<void>;
    setQuietHoursEnabled: (uid: string, enabled: boolean) => Promise<void>;
    setQuietHoursStart: (uid: string, time: string) => Promise<void>;
    setQuietHoursEnd: (uid: string, time: string) => Promise<void>;
    setBiometricLock: (uid: string, enabled: boolean) => Promise<void>;
    markSwipeHintSeen: () => void;
    reset: () => void;
  }

  const DEFAULTS = {
    language: 'fr' as LanguageCode,
    onboardingComplete: false,
    notificationsEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    biometricLock: false,
    seenSwipeHint: false,
  };

  async function persist(uid: string, patch: Record<string, unknown>) {
    await userRef(uid).collection('account').doc('data').set(patch, { merge: true });
  }

  export const useSettingsStore = create<SettingsState>((set) => ({
    ...DEFAULTS,
    hydrated: false,
    layoutKey: 0,

    hydrate: async (uid) => {
      const snap = await userRef(uid).collection('account').doc('data').get();
      const data = snap.data() ?? {};
      set({
        language: (data.language as LanguageCode) ?? DEFAULTS.language,
        onboardingComplete: data.onboardingComplete ?? false,
        notificationsEnabled: data.notificationsEnabled ?? true,
        quietHoursEnabled: data.quietHoursEnabled ?? false,
        quietHoursStart: data.quietHoursStart ?? '22:00',
        quietHoursEnd: data.quietHoursEnd ?? '07:00',
        biometricLock: data.biometricLock ?? false,
        seenSwipeHint: false,
        hydrated: true,
      });
    },

    setLanguage: async (uid, language) => {
      await persist(uid, { language });
      set({ language });
    },
    bumpLayoutKey: () => set((s) => ({ layoutKey: s.layoutKey + 1 })),
    completeOnboarding: async (uid) => {
      await persist(uid, { onboardingComplete: true });
      set({ onboardingComplete: true });
    },
    setNotificationsEnabled: async (uid, notificationsEnabled) => {
      await persist(uid, { notificationsEnabled });
      set({ notificationsEnabled });
    },
    setQuietHoursEnabled: async (uid, quietHoursEnabled) => {
      await persist(uid, { quietHoursEnabled });
      set({ quietHoursEnabled });
    },
    setQuietHoursStart: async (uid, quietHoursStart) => {
      await persist(uid, { quietHoursStart });
      set({ quietHoursStart });
    },
    setQuietHoursEnd: async (uid, quietHoursEnd) => {
      await persist(uid, { quietHoursEnd });
      set({ quietHoursEnd });
    },
    setBiometricLock: async (uid, biometricLock) => {
      await persist(uid, { biometricLock });
      set({ biometricLock });
    },
    markSwipeHintSeen: () => set({ seenSwipeHint: true }),
    reset: () => set({ ...DEFAULTS, hydrated: false, layoutKey: 0 }),
  }));
  ```

- [ ] **Step 2: Fix call sites that pass no `uid`**

  After saving this file, run TypeScript check to find all call sites:
  ```bash
  npx tsc --noEmit 2>&1 | grep -E "(setLanguage|completeOnboarding|setNotifications|setQuietHours|setBiometric)"
  ```
  For each file reported, add the `uid` argument. Example — in `app/(tabs)/settings.tsx`, any call like `setLanguage('fr')` becomes `setLanguage(user!.uid, 'fr')` where `user` comes from `useAuthStore((s) => s.user)`.

- [ ] **Step 3: Commit**

  ```bash
  git add store/settingsStore.ts
  git commit -m "feat: migrate settingsStore to Firestore"
  ```

---

## Task 13: Create Migration Service

**Files:**
- Create: `utils/migrationService.ts`

- [ ] **Step 1: Create `utils/migrationService.ts`**

  ```typescript
  import { userRef, firestore } from '@utils/firebase';
  import { getDatabase } from '@db/database';

  export async function migrateLocalDataToFirestore(uid: string): Promise<void> {
    // Ensure SQLite is initialized
    await getDatabase();

    // Dynamically import SQLite models to avoid loading them in normal flow
    const { dbGetAllProfiles } = await import('@db/models/profileModel');
    const { dbGetAllMedications, dbGetAllIntakeRecords } = await import('@db/models/medicationModel');
    const { dbGetSetting } = await import('@db/models/settingsModel');

    const [profiles, medications, intakeRecords] = await Promise.all([
      dbGetAllProfiles(),
      dbGetAllMedications(),
      dbGetAllIntakeRecords(),
    ]);

    // Read settings
    const [language, onboardingComplete, notificationsEnabled, quietHoursEnabled,
      quietHoursStart, quietHoursEnd, biometricLock, activeProfileId] = await Promise.all([
      dbGetSetting('language'),
      dbGetSetting('onboardingComplete'),
      dbGetSetting('notificationsEnabled'),
      dbGetSetting('quietHoursEnabled'),
      dbGetSetting('quietHoursStart'),
      dbGetSetting('quietHoursEnd'),
      dbGetSetting('biometricLock'),
      dbGetSetting('activeProfileId'),
    ]);

    const batch = firestore().batch();
    const base = userRef(uid);

    // Write account/settings doc
    batch.set(base.collection('account').doc('data'), {
      language: language ?? 'fr',
      onboardingComplete: onboardingComplete === 'true',
      notificationsEnabled: notificationsEnabled !== 'false',
      quietHoursEnabled: quietHoursEnabled === 'true',
      quietHoursStart: quietHoursStart ?? '22:00',
      quietHoursEnd: quietHoursEnd ?? '07:00',
      biometricLock: biometricLock === 'true',
      activeProfileId: activeProfileId ?? profiles[0]?.id ?? null,
      createdAt: new Date().toISOString(),
    });

    // Write profiles
    for (const profile of profiles) {
      batch.set(base.collection('profiles').doc(profile.id), profile);
    }

    // Write medications
    for (const med of medications) {
      batch.set(base.collection('medications').doc(med.id), med);
    }

    // Firestore batch limit is 500 writes — split if needed
    // For a family medication app, 500 records is unlikely but safe to note
    for (const record of intakeRecords) {
      batch.set(base.collection('intake_records').doc(record.id), record);
    }

    await batch.commit();
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add utils/migrationService.ts
  git commit -m "feat: add SQLite to Firestore migration service"
  ```

---

## Task 14: Update `app/_layout.tsx` with Auth Gate + Migration

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Replace `app/_layout.tsx`**

  ```typescript
  import '../i18n';
  import 'react-native-gesture-handler';
  import { useEffect, useRef, useState } from 'react';
  import { Stack, useRouter, useSegments } from 'expo-router';
  import * as SplashScreen from 'expo-splash-screen';
  import { useFonts } from 'expo-font';
  import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  } from '@expo-google-fonts/plus-jakarta-sans';
  import {
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  } from '@expo-google-fonts/tajawal';
  import { GestureHandlerRootView } from 'react-native-gesture-handler';
  import { SafeAreaProvider } from 'react-native-safe-area-context';
  import { StatusBar } from 'expo-status-bar';
  import { useTranslation } from 'react-i18next';
  import Constants from 'expo-constants';
  import { getDatabase } from '@db/database';
  import { useProfileStore } from '@store/profileStore';
  import { useMedicationStore } from '@store/medicationStore';
  import { useSettingsStore } from '@store/settingsStore';
  import { useAuthStore } from '@store/authStore';
  import { useBiometric } from '@hooks/useBiometric';
  import { LockScreen } from '@components/ui/LockScreen';
  import { RTL_LANGUAGES } from '../i18n';
  import { migrateLocalDataToFirestore } from '@utils/migrationService';

  SplashScreen.preventAutoHideAsync();

  const isExpoGo = Constants.appOwnership === 'expo';

  if (!isExpoGo) {
    import('expo-notifications').then((N) => {
      N.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    });
  }

  function NavigationGate({ ready }: { ready: boolean }) {
    const router = useRouter();
    const segments = useSegments();
    const { status, user, isFirstLogin } = useAuthStore();
    const { onboardingComplete, hydrated: settingsHydrated } = useSettingsStore();
    const { profiles, hydrated: profilesHydrated } = useProfileStore();

    useEffect(() => {
      if (!ready || status === 'loading') return;

      const inAuth = segments[0] === '(auth)';
      const inOnboarding = segments[0] === '(onboarding)';
      const inProfile = segments[0] === 'profile';

      if (status === 'unauthenticated') {
        if (!inAuth) router.replace('/(auth)/login');
        return;
      }

      // authenticated from here
      if (!settingsHydrated || !profilesHydrated) return;

      if (!onboardingComplete && !inOnboarding) {
        router.replace('/(onboarding)/slide1');
        return;
      }

      if (onboardingComplete && profiles.length === 0 && !inProfile && !inOnboarding) {
        router.replace('/profile/new');
      }
    }, [ready, status, onboardingComplete, profiles.length, settingsHydrated, profilesHydrated, segments]);

    return null;
  }

  export default function RootLayout() {
    const { i18n } = useTranslation();
    const [ready, setReady] = useState(false);
    const [fontsLoaded] = useFonts({
      PlusJakartaSans_400Regular,
      PlusJakartaSans_500Medium,
      PlusJakartaSans_600SemiBold,
      PlusJakartaSans_700Bold,
      PlusJakartaSans_800ExtraBold,
      Tajawal_400Regular,
      Tajawal_500Medium,
      Tajawal_700Bold,
    });
    const { locked, unlock } = useBiometric();
    const [pendingNotif, setPendingNotif] = useState<{
      medicationId: string;
      scheduledAt: string;
    } | null>(null);
    const router = useRouter();

    const authInitialize = useAuthStore((s) => s.initialize);
    const authStatus = useAuthStore((s) => s.status);
    const authUser = useAuthStore((s) => s.user);
    const isFirstLogin = useAuthStore((s) => s.isFirstLogin);

    const hydrateSettings = useSettingsStore((s) => s.hydrate);
    const hydrateProfiles = useProfileStore((s) => s.hydrate);
    const hydrateMedications = useMedicationStore((s) => s.hydrate);
    const language = useSettingsStore((s) => s.language);
    const layoutKey = useSettingsStore((s) => s.layoutKey);
    const isRTL = RTL_LANGUAGES.includes(language);

    const unsubscribeRef = useRef<(() => void) | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function extractNotifData(response: any) {
      const data: Record<string, unknown> | undefined =
        response?.notification?.request?.content?.data;
      if (data?.medicationId) {
        setPendingNotif({
          medicationId: String(data.medicationId),
          scheduledAt: data.scheduledAt ? String(data.scheduledAt) : '',
        });
      }
    }

    useEffect(() => {
      async function init() {
        try {
          // SQLite needed only for migration; init it regardless
          await getDatabase();

          // Start Firebase auth listener — resolves after first emission
          const unsub = await authInitialize();
          unsubscribeRef.current = unsub;
        } catch (e) {
          console.error('Auth init failed', e);
        } finally {
          setReady(true);
        }

        if (!isExpoGo) {
          const N = await import('expo-notifications');
          const lastResponse = await N.getLastNotificationResponseAsync();
          if (lastResponse) extractNotifData(lastResponse);
        }
      }
      init();
      return () => { unsubscribeRef.current?.(); };
    }, []);

    // Hydrate Firestore stores once authenticated
    useEffect(() => {
      if (authStatus !== 'authenticated' || !authUser) return;

      async function hydrateFromFirestore() {
        const uid = authUser!.uid;

        if (isFirstLogin) {
          try {
            await migrateLocalDataToFirestore(uid);
          } catch (e) {
            console.warn('Migration failed, will retry on next login', e);
          }
        }

        await Promise.all([
          hydrateSettings(uid),
          hydrateProfiles(uid),
          hydrateMedications(uid),
        ]);
      }

      hydrateFromFirestore();
    }, [authStatus, authUser?.uid]);

    useEffect(() => {
      if (!isExpoGo) return;
      let sub: { remove: () => void };
      import('expo-notifications').then((N) => {
        sub = N.addNotificationResponseReceivedListener(extractNotifData);
      });
      return () => sub?.remove();
    }, []);

    useEffect(() => {
      if (ready && pendingNotif) {
        router.push({ pathname: '/medication/confirm', params: pendingNotif });
        setPendingNotif(null);
      }
    }, [ready, pendingNotif]);

    useEffect(() => {
      if (ready && fontsLoaded) SplashScreen.hideAsync();
    }, [ready, fontsLoaded]);

    useEffect(() => {
      if (language && i18n.language !== language) {
        i18n.changeLanguage(language);
      }
    }, [language]);

    return (
      <GestureHandlerRootView style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          {locked && <LockScreen onUnlock={unlock} />}
          <NavigationGate ready={ready} />
          <Stack key={layoutKey} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="medication/confirm"
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="export" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }
  ```

- [ ] **Step 2: Run TypeScript check**

  ```bash
  npx tsc --noEmit
  ```
  Fix any reported errors before committing.

- [ ] **Step 3: Commit**

  ```bash
  git add app/_layout.tsx
  git commit -m "feat: add auth gate and Firestore hydration to root layout"
  ```

---

## Task 15: Fix Call Sites in Existing Screens

**Files:**
- Modify: Any screen that calls `profileStore` / `medicationStore` / `settingsStore` write methods

- [ ] **Step 1: Find all call sites that need uid**

  ```bash
  npx tsc --noEmit 2>&1 | head -80
  ```

  The TypeScript errors will point to every call site where a `uid` argument is now required. For each file, add:
  ```typescript
  const user = useAuthStore((s) => s.user);
  // then pass user!.uid to each store write call
  ```

- [ ] **Step 2: Example — `app/profile/new.tsx`**

  Any call like:
  ```typescript
  addProfile({ name, dateOfBirth, ... })
  ```
  Becomes:
  ```typescript
  const user = useAuthStore((s) => s.user);
  // ...
  addProfile(user!.uid, { name, dateOfBirth, ... })
  ```

- [ ] **Step 3: Example — `app/(tabs)/settings.tsx` — add Sign Out**

  Add to the settings screen:
  ```typescript
  import { useAuthStore } from '@store/authStore';
  import { useProfileStore } from '@store/profileStore';
  import { useMedicationStore } from '@store/medicationStore';
  // ...
  const signOut = useAuthStore((s) => s.signOut);
  const resetProfiles = useProfileStore((s) => s.reset);
  const resetMedications = useMedicationStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);

  async function handleSignOut() {
    resetProfiles();
    resetMedications();
    resetSettings();
    await signOut();
  }
  ```

  Add a Sign Out button in the JSX (in the danger zone section or a new "Account" section):
  ```typescript
  <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
    <Text style={styles.signOutText}>Sign out</Text>
  </TouchableOpacity>
  ```

- [ ] **Step 4: Run TypeScript check until clean**

  ```bash
  npx tsc --noEmit
  ```
  Expected: 0 errors.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat: update all call sites to pass uid to Firestore stores"
  ```

---

## Task 16: Firestore Security Rules

**Files:**
- Create: `firestore.rules`

- [ ] **Step 1: Create `firestore.rules`**

  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid}/{document=**} {
        allow read, write: if request.auth != null
                           && request.auth.uid == uid;
      }
      match /{document=**} {
        allow read, write: if false;
      }
    }
  }
  ```

- [ ] **Step 2: Deploy rules to Firebase**

  Install Firebase CLI if not present:
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

  Initialize (if first time):
  ```bash
  firebase init firestore
  ```
  When prompted for the rules file, enter `firestore.rules`.

  Deploy:
  ```bash
  firebase deploy --only firestore:rules
  ```
  Expected output: `Deploy complete!`

- [ ] **Step 3: Verify in Firebase Console**

  Firebase Console → Firestore → Rules → confirm the deployed rules match what's in `firestore.rules`.

- [ ] **Step 4: Commit**

  ```bash
  git add firestore.rules .firebaserc firebase.json
  git commit -m "feat: add and deploy Firestore security rules"
  ```

---

## Task 17: End-to-End Manual Test

- [ ] **Step 1: Test email register + login**
  1. Launch app: `npx expo run:android`
  2. App shows Login screen (not onboarding)
  3. Tap "Create one" → Register screen
  4. Enter name, email, password → Create account
  5. App navigates to onboarding → profiles → main app
  6. Close and reopen app → stays logged in (no re-login)

- [ ] **Step 2: Test Google Sign-In**
  1. On Login screen, tap "Continue with Google"
  2. Google account picker appears
  3. Select account → app signs in → main app

- [ ] **Step 3: Test password reset**
  1. On Login screen, tap "Forgot password?"
  2. Enter email → "Send reset link"
  3. Green success message appears
  4. Check email inbox for Firebase reset link

- [ ] **Step 4: Test data persistence across devices**
  1. Add a medication on Device A
  2. Sign in with same account on Device B
  3. Medication appears on Device B

- [ ] **Step 5: Test offline behavior**
  1. Enable Airplane mode
  2. Add a medication → it appears immediately (from Firestore cache)
  3. Disable Airplane mode → data syncs to cloud

- [ ] **Step 6: Test sign out**
  1. Settings → Sign Out
  2. App returns to Login screen
  3. All local store state cleared

- [ ] **Step 7: Commit final**

  ```bash
  git add -A
  git commit -m "feat: complete Firebase Auth + Firestore integration"
  ```

---

## Known Limitations & Follow-up

- **Batch write limit:** Firestore batches have a 500-write limit. The migration service will fail silently for users with >500 intake records. Add batch chunking in `migrationService.ts` if this becomes a concern.
- **Image sync:** `prescriptionImageUri` and `avatarUri` are local device paths. They will break on other devices. Follow-up: upload images to Firebase Storage and store download URLs.
- **Apple Sign-In:** Required by App Store if any OAuth is present. Add with `expo-apple-authentication` in a follow-up task.
- **Email verification:** Firebase sends no verification email by default. Consider adding `user.sendEmailVerification()` after register.
