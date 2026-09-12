// Mock all native/firebase modules before any imports so the module-level
// side-effects in utils/firebase.ts (GoogleSignin.configure, getAuth, etc.)
// are satisfied without native bridge code.
jest.mock('@react-native-firebase/auth', () => ({ getAuth: jest.fn(() => ({})) }));
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({ doc: jest.fn(() => ({})) })),
    batch: jest.fn(() => ({})),
    settings: jest.fn(),
  })),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: { configure: jest.fn() },
}));
jest.mock('@constants/firebaseConfig', () => ({ WEB_CLIENT_ID: 'test-client-id' }));

import { mapFirebaseError } from '../../utils/firebase';

// ─── mapFirebaseError ─────────────────────────────────────────────────────────

describe('mapFirebaseError', () => {
  it('maps email-already-in-use → auth.errors.emailInUse', () => {
    expect(mapFirebaseError('auth/email-already-in-use')).toBe('auth.errors.emailInUse');
  });

  it('maps wrong-password → auth.errors.invalidCredential', () => {
    expect(mapFirebaseError('auth/wrong-password')).toBe('auth.errors.invalidCredential');
  });

  it('maps user-not-found → auth.errors.invalidCredential', () => {
    expect(mapFirebaseError('auth/user-not-found')).toBe('auth.errors.invalidCredential');
  });

  it('maps invalid-credential → auth.errors.invalidCredential', () => {
    expect(mapFirebaseError('auth/invalid-credential')).toBe('auth.errors.invalidCredential');
  });

  it('maps too-many-requests → auth.errors.tooManyRequests', () => {
    expect(mapFirebaseError('auth/too-many-requests')).toBe('auth.errors.tooManyRequests');
  });

  it('maps network-request-failed → auth.errors.networkError', () => {
    expect(mapFirebaseError('auth/network-request-failed')).toBe('auth.errors.networkError');
  });

  it('maps weak-password → auth.errors.weakPassword', () => {
    expect(mapFirebaseError('auth/weak-password')).toBe('auth.errors.weakPassword');
  });

  it('maps unknown code → common.error', () => {
    expect(mapFirebaseError('auth/some-unknown-code')).toBe('common.error');
  });

  it('maps empty string → common.error', () => {
    expect(mapFirebaseError('')).toBe('common.error');
  });
});
