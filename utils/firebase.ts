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
