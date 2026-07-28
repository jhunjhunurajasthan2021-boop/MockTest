import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let firestoreInstance: any = null;
try {
  const dbId = (firebaseConfig as any)?.firestoreDatabaseId;
  if (dbId && dbId !== '(default)') {
    firestoreInstance = getFirestore(app, dbId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (err) {
  try {
    firestoreInstance = getFirestore(app);
  } catch (e) {
    console.warn('Failed to initialize Firestore:', e);
  }
}
export const db = firestoreInstance;

const provider = new GoogleAuthProvider();
// Request Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Suppress uncaught Firebase auth popup rejections caused by browser/iframe restrictions
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(
      event.reason?.message || event.reason?.code || event.reason || ''
    );
    if (
      reasonStr.includes('INTERNAL ASSERTION') ||
      reasonStr.includes('cancelled-popup-request') ||
      reasonStr.includes('popup-blocked') ||
      reasonStr.includes('popup-closed')
    ) {
      event.preventDefault();
      console.warn('Suppressed Firebase Auth Popup Exception:', event.reason);
    }
  });
}

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google Drive login.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.warn('Sign in error caught:', error);
    const msg = String(error?.message || error?.code || error?.stack || error || '');
    if (
      isInIframe ||
      msg.includes('INTERNAL ASSERTION') ||
      msg.includes('Pending promise') ||
      msg.includes('popup-blocked') ||
      msg.includes('popup-closed') ||
      msg.includes('cancelled-popup-request') ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/popup-closed'
    ) {
      throw new Error(
        'Google Drive लॉगिन फ़्रेम (iframe preview) या पॉप-अप सुरक्षा के कारण बंद हुआ। कृपया अपने कंप्यूटर/मोबाइल से सीधे "Select File" बटन द्वारा फ़ाइल अपलोड करें, अथवा ऐप को "Open in New Tab" में खोलें।'
      );
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutUser = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
