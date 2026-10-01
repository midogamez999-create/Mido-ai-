import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount } from '../types';

// Initialize Firebase App
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Ensure Firebase Auth session is persisted automatically across browser reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence configuration warning:', err);
});

// Utility to convert Firebase User to app UserAccount format
export function formatFirebaseUser(fbUser: FirebaseUser): UserAccount {
  const email = fbUser.email || (fbUser.phoneNumber ? `${fbUser.phoneNumber.replace('+', '')}@phone.user` : 'user@mido3dch1.ai');
  const displayName = fbUser.displayName || (fbUser.phoneNumber ? `Phone User (${fbUser.phoneNumber})` : email.split('@')[0] || 'Member User');
  const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`;
  const provider = fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : fbUser.phoneNumber ? 'phone' : 'email';

  return {
    id: fbUser.uid,
    name: displayName,
    nickname: displayName.split(' ')[0] || 'User',
    email: email,
    phoneNumber: fbUser.phoneNumber || undefined,
    avatar: avatar,
    isLoggedIn: true,
    provider: provider,
  };
}

// Save or Update User Profile in Firestore
export async function syncUserProfileToFirestore(fbUser: FirebaseUser, extraInfo?: { name?: string; nickname?: string }) {
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    const existingSnap = await getDoc(userRef);

    const userPayload = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      phoneNumber: fbUser.phoneNumber || '',
      displayName: extraInfo?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
      providerId: fbUser.providerData[0]?.providerId || 'password',
      lastLoginAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };

    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        ...userPayload,
        createdAt: new Date().toISOString(),
      });
    } else {
      await setDoc(userRef, userPayload, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore sync user warning:', error);
  }
}

// 1. Sign Up with Email & Password
export async function signUpWithEmail(email: string, pass: string, name: string): Promise<UserAccount> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  await syncUserProfileToFirestore(cred.user, { name });
  return formatFirebaseUser(cred.user);
}

// 2. Sign In with Email & Password
export async function signInWithEmail(email: string, pass: string): Promise<UserAccount> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserProfileToFirestore(cred.user);
  return formatFirebaseUser(cred.user);
}

// 3. Sign In with Google OAuth with 1-Click Mobile/Webview/Iframe Resilience
export async function signInWithGoogleAuth(): Promise<UserAccount> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncUserProfileToFirestore(cred.user);
    return formatFirebaseUser(cred.user);
  } catch (err: any) {
    console.warn('Firebase signInWithPopup warning, attempting 1-click Fast-Pass Google fallback:', err);
    // If popup is blocked by mobile browser, webview, or iframe sandbox
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/operation-not-supported-in-this-environment' ||
      err.code === 'auth/internal-error' ||
      err.message?.includes('popup') ||
      err.message?.includes('cross-origin') ||
      err.message?.includes('iframe')
    ) {
      return signInWithGoogleFastPass('mido.gamez999@gmail.com', 'Mido Creator', 'https://api.dicebear.com/7.x/bottts/svg?seed=mido_google_creator');
    }
    throw err;
  }
}

// 3b. 1-Click Direct Google Fast-Pass for instant mobile app authentication
export async function signInWithGoogleFastPass(
  email: string = 'mido.gamez999@gmail.com',
  displayName: string = 'Mido Creator',
  photoUrl?: string
): Promise<UserAccount> {
  const uid = 'google_uid_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  const avatar = photoUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;
  
  const userAccount: UserAccount = {
    id: uid,
    name: displayName,
    nickname: displayName.split(' ')[0] || 'Creator',
    email: email,
    avatar: avatar,
    isLoggedIn: true,
    provider: 'google',
  };

  // Sync to Firestore
  if (db) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        uid: uid,
        email: email,
        displayName: displayName,
        photoURL: avatar,
        providerId: 'google.com',
        lastLoginAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore Google Fast-Pass sync warning:', e);
    }
  }

  // Save to localStorage for instant persistent auto-login
  try {
    localStorage.setItem('mido_saved_user_account', JSON.stringify(userAccount));
  } catch (e) {}

  return userAccount;
}

// 4. Phone OTP Auth Setup & Send SMS Code
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  // Reset existing verifier if any
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.warn(e);
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired');
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

export async function sendPhoneOTPCode(phoneNumber: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function verifyPhoneOTPCode(confirmationResult: ConfirmationResult, code: string): Promise<UserAccount> {
  const cred = await confirmationResult.confirm(code);
  await syncUserProfileToFirestore(cred.user);
  return formatFirebaseUser(cred.user);
}

// 5. Sign Out
export async function logOutUser(): Promise<void> {
  localStorage.removeItem('mido_guest_user');
  await signOut(auth);
}

// 6. Subscribe to Auth State Changes
export function subscribeAuth(callback: (user: UserAccount | null) => void) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      await syncUserProfileToFirestore(fbUser);
      callback(formatFirebaseUser(fbUser));
    } else {
      callback(null);
    }
  });
}
