# Auth System Design — Dosly (MediTrack)
**Date:** 2026-09-10  
**Status:** Approved  

---

## Overview

Full authentication system for the Dosly app using Firebase Auth + Firestore, replacing the current local-only SQLite architecture with cloud-synced, multi-device data. Supports Email/Password and Google Sign-In. Existing biometric lock remains as a secondary session guard.

---

## Tech Stack

### New packages to install
```
@react-native-firebase/app
@react-native-firebase/auth
@react-native-firebase/firestore
@react-native-google-signin/google-signin
```

### Firebase Console setup required
- Create Firebase project
- Enable Authentication: Email/Password + Google providers
- Create Firestore database (production mode)
- Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- Deploy Firestore security rules

---

## Firestore Data Model

```
users/
  {uid}/
    account/              # doc: email, displayName, photoURL, createdAt, language
    profiles/
      {profileId}/        # doc: name, DOB, relationship, bloodType, allergies, conditions,
                          #      doctorName, doctorPhone, emergencyContact, emergencyPhone,
                          #      medicalNotes, avatarUri, createdAt
        medications/
          {medId}/        # doc: name, dosage, type, schedule (JSON), startDate, endDate,
                          #      notes, prescriptionImageUri, refillReminderEnabled,
                          #      refillReminderDays, createdAt
            intake_records/
              {recordId}/ # doc: scheduledAt, takenAt, skipped, medicationId, profileId
```

All IDs remain UUIDs (compatible with existing SQLite IDs).

---

## Auth State — `store/authStore.ts`

```typescript
interface AuthState {
  user: {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
  } | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isFirstLogin: boolean  // triggers SQLite → Firestore migration

  signInWithEmail(email: string, password: string): Promise<void>
  signInWithGoogle(): Promise<void>
  register(email: string, password: string, displayName: string): Promise<void>
  sendPasswordReset(email: string): Promise<void>
  signOut(): Promise<void>
  initialize(): Promise<void>
}
```

---

## App Boot Sequence (`app/_layout.tsx` updated)

```
1. Load fonts + initialize SQLite (for migration only)
2. authStore.initialize()          ← NEW: restores Firebase session
3. status === 'loading'            → splash screen
4. status === 'unauthenticated'    → (auth) stack
5. status === 'authenticated':
   a. isFirstLogin === true        → run migration → set isFirstLogin = false
   b. Hydrate Zustand stores from Firestore (replaces SQLite hydrate)
   c. Check onboarding complete    → if not, go to (onboarding)
   d. Check profiles exist         → if not, go to profile/new
   e. Main app (tabs)
6. Biometric lock overlay          → unchanged, on top of all routes
```

---

## Navigation Structure

Add `(auth)` route group:

```
app/
  (auth)/
    _layout.tsx     # Stack layout for auth screens
    login.tsx       # Email/password + Google button
    register.tsx    # New account form
    forgot.tsx      # Password reset
  (tabs)/           # unchanged
  (onboarding)/     # unchanged
  profile/          # unchanged
```

`app/_layout.tsx` routes to `(auth)` when `status === 'unauthenticated'`.

---

## Auth Screens

### Login (`app/(auth)/login.tsx`)
- Email field
- Password field (with show/hide toggle)
- "Forgot password?" link → forgot.tsx
- "Sign In" button
- Divider "or"
- "Continue with Google" button
- "Don't have an account? Create one" → register.tsx
- RTL-aware via existing `useIsRTL` hook
- All strings in i18n (en/fr/ar)

### Register (`app/(auth)/register.tsx`)
- Name, Email, Password, Confirm Password fields
- Validation: email format, password min 8 chars, passwords match
- On success → auto sign-in → migration check → onboarding

### Forgot Password (`app/(auth)/forgot.tsx`)
- Email field only
- Sends Firebase password reset email
- Success state shown inline (no navigation away)

---

## Error Handling

| Firebase error code | User-facing message |
|---|---|
| `auth/email-already-in-use` | "An account with this email already exists" |
| `auth/wrong-password` | "Incorrect email or password" |
| `auth/user-not-found` | "Incorrect email or password" |
| `auth/too-many-requests` | "Too many attempts. Try again later." |
| `auth/network-request-failed` | "No internet connection" |
| `auth/weak-password` | "Password must be at least 8 characters" |

Never reveal whether an email exists or not (merge wrong-password + user-not-found messages).

---

## Google Sign-In Flow

```
1. User taps "Continue with Google"
2. GoogleSignin.signIn() → receives idToken
3. firebase.auth().signInWithCredential(
     GoogleAuthProvider.credential(idToken)
   )
4. Firebase returns FirebaseUser → standard post-login flow
```

Requires `@react-native-google-signin/google-signin` configured with the Web Client ID from Firebase Console.

---

## Session Persistence

- Firebase Auth persists session to device secure storage automatically
- App re-open → user already authenticated, no re-login prompt
- Biometric lock fires on app foreground (existing behavior, unchanged)
- Biometric lock does NOT sign the user out — it only blocks UI
- "Sign Out" in Settings explicitly: clears Firebase session + resets all Zustand stores

---

## Existing Store Changes

Each store (`profileStore`, `medicationStore`, `settingsStore`) updated:

| Current | After |
|---|---|
| `hydrate()` reads from SQLite | `hydrate(uid)` reads from Firestore |
| Write actions → SQLite | Write actions → Firestore |
| `reset()` clears Zustand | `reset()` clears Zustand (unchanged) |

Firestore offline persistence (enabled on init) handles local caching transparently.

---

## Data Migration (`utils/migrationService.ts`)

Triggered once when `isFirstLogin === true` after first successful login.

```
1. Check if SQLite has existing data
2. If no data → skip (fresh install), mark migration done
3. If data exists:
   a. Read all profiles, medications, intake_records from SQLite
   b. Build Firestore writeBatch() for users/{uid}/...
   c. Commit batch (atomic — all or nothing)
   d. On success → drop SQLite tables, set isFirstLogin = false
   e. On failure → keep SQLite intact, surface error, retry next login
```

**User-facing on failure:** "Sync failed. Your data is safe on this device. Will retry on next launch."

---

## Firestore Security Rules

```javascript
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

- Authenticated users access only their own subtree
- No cross-user data access possible
- All unauthenticated requests rejected at DB level

---

## Offline Behavior

Firestore offline persistence enabled at app init:
```typescript
firebase.firestore().settings({ persistence: true });
```

- Writes while offline → queued locally → auto-sync on reconnect
- Reads while offline → served from local Firestore cache
- No manual offline handling needed

---

## i18n

New translation keys added to `i18n/locales/en.json`, `fr.json`, `ar.json`:
- `auth.login`, `auth.register`, `auth.forgotPassword`
- `auth.email`, `auth.password`, `auth.confirmPassword`, `auth.name`
- `auth.signIn`, `auth.createAccount`, `auth.continueWithGoogle`
- `auth.forgotPasswordLink`, `auth.noAccount`, `auth.alreadyHaveAccount`
- `auth.resetPasswordSent`, `auth.errors.*` (all error codes)

---

## Out of Scope (future)

- Apple Sign-In (required if published to iOS App Store)
- Email verification on register
- Account deletion / data export (GDPR)
- Multi-factor authentication
- Admin dashboard
