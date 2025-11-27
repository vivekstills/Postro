// Firebase Authentication Helper Functions
import {
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Email + Password Sign-Up
export const signUpWithEmailAndPassword = async (
    email: string,
    password: string,
    displayName?: string
): Promise<User> => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
        await updateProfile(credential.user, { displayName });
    }
    await saveUserToFirestore(credential.user);
    return credential.user;
};

// Email + Password Sign-In
export const signInWithEmailPassword = async (email: string, password: string): Promise<User> => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    const credential = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(credential.user);
    return credential.user;
};

// Sign Out
export const signOutUser = async (): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    try {
        await signOut(auth);
    } catch (error: any) {
        console.error('Sign out error:', error);
        throw error;
    }
};

// Listen to Auth State Changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    return onAuthStateChanged(auth, callback);
};

// Save User to Firestore
export const saveUserToFirestore = async (user: User): Promise<void> => {
    if (!db) throw new Error('Firestore is not initialized');

    const userRef = doc(db, 'users', user.uid);

    // Check if user already exists
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            phoneNumber: user.phoneNumber || null,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        });
    } else {
        // Update last login time
        await setDoc(
            userRef,
            {
                lastLoginAt: serverTimestamp(),
            },
            { merge: true }
        );
    }
};

// Get User Data from Firestore
export const getUserData = async (uid: string) => {
    if (!db) throw new Error('Firestore is not initialized');

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    }

    return null;
};
