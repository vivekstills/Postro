// Firebase Authentication Helper Functions
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type User,
    type ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Google Sign-In
export const signInWithGoogle = async (): Promise<User | null> => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Save user to Firestore
        await saveUserToFirestore(user);

        return user;
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Phone Sign-In - Step 1: Send OTP
export const sendOTP = async (
    phoneNumber: string,
    recaptchaContainerId: string
): Promise<ConfirmationResult> => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    try {
        // Initialize reCAPTCHA verifier
        const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
            size: 'invisible',
            callback: () => {
                console.log('reCAPTCHA solved');
            },
        });

        // Send OTP
        const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            recaptchaVerifier
        );

        return confirmationResult;
    } catch (error: any) {
        console.error('Send OTP error:', error);
        throw error;
    }
};

// Phone Sign-In - Step 2: Verify OTP
export const verifyOTP = async (
    confirmationResult: ConfirmationResult,
    code: string
): Promise<User | null> => {
    try {
        const result = await confirmationResult.confirm(code);
        const user = result.user;

        // Save user to Firestore
        await saveUserToFirestore(user);

        return user;
    } catch (error: any) {
        console.error('OTP verification error:', error);
        throw error;
    }
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
