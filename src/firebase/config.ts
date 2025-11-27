// Firebase Configuration
import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseConfigKeys =
    | 'apiKey'
    | 'authDomain'
    | 'projectId'
    | 'storageBucket'
    | 'messagingSenderId'
    | 'appId';

const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyDXdZwTlrHVJFtSfuxLUoO6n7qprJna13w',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'postro-b3503.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'postro-b3503',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'postro-b3503.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '249555334306',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:249555334306:web:c279c563697845b66e93fb',
};

export const missingFirebaseKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key as FirebaseConfigKeys);

export const isFirebaseConfigured = missingFirebaseKeys.length === 0;
export const firebaseConfigError = !isFirebaseConfigured
    ? `Missing Firebase environment variable(s): ${missingFirebaseKeys.join(', ')}`
    : null;

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

if (auth) {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Failed to set auth persistence:', error);
    });
}

export default firebaseApp;
