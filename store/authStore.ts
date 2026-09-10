import { create } from 'zustand';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import type { User } from '@react-native-firebase/auth';
import { auth, userRef, mapFirebaseError } from '@utils/firebase';

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

function toAuthUser(u: User): AuthUser {
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
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
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
      await signInWithEmailAndPassword(auth, email, password);
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
      const credential = GoogleAuthProvider.credential(data?.idToken ?? '');
      await signInWithCredential(auth, credential);
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
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user as any, { displayName });
    } catch (e: any) {
      set({ error: mapFirebaseError(e.code) });
      throw e;
    }
  },

  sendPasswordReset: async (email) => {
    set({ error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e: any) {
      set({ error: mapFirebaseError(e.code) });
      return false;
    }
  },

  signOut: async () => {
    await auth.signOut();
    try { await GoogleSignin.signOut(); } catch (_) {}
    set({ user: null, status: 'unauthenticated', isFirstLogin: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
