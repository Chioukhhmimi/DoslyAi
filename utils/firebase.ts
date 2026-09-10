import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { WEB_CLIENT_ID } from '@constants/firebaseConfig';

// v26 modular API: persistence is enabled by default on native.
GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });

export const auth = getAuth();

// getFirestore() returns the Firestore interface, but the runtime value is
// FirebaseFirestoreModule which has the legacy .collection()/.batch() methods.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _db: any = getFirestore();
export const firestore = _db as {
  collection: (path: string) => any;
  batch: () => any;
  settings: (settings: Record<string, unknown>) => void;
};

export const userRef = (uid: string) =>
  firestore.collection('users').doc(uid);

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
