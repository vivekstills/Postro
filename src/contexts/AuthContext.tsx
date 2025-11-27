// Authentication Context - Global Auth State Management
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, ConfirmationResult } from 'firebase/auth';
import {
    signInWithGoogle as googleSignIn,
    sendOTP as sendOTPFirebase,
    verifyOTP as verifyOTPFirebase,
    signOutUser as signOutFirebase,
    onAuthStateChange,
} from '../firebase/auth';
import { useToast } from '../components/ToastProvider';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    sendOTP: (phoneNumber: string) => Promise<void>;
    verifyOTP: (code: string) => Promise<void>;
    signOut: () => Promise<void>;
    confirmationResult: ConfirmationResult | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const { addToast } = useToast();

    // Listen to auth state changes
    useEffect(() => {
        if (!isFirebaseConfigured) {
            setLoading(false);
            return () => { };
        }

        const unsubscribe = onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Google Sign-In
    const signInWithGoogle = async () => {
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED');
            return;
        }
        try {
            const user = await googleSignIn();
            if (user) {
                addToast(`SIGNED IN AS ${user.displayName?.toUpperCase() || 'USER'}`);
            }
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                addToast('SIGN-IN CANCELLED');
            } else {
                addToast('ERROR • Failed to sign in with Google');
            }
            throw error;
        }
    };

    // Send OTP to Phone Number
    const sendOTP = async (phoneNumber: string) => {
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED');
            return;
        }
        try {
            const result = await sendOTPFirebase(phoneNumber, 'recaptcha-container');
            setConfirmationResult(result);
            addToast('OTP SENT • CHECK YOUR PHONE');
        } catch (error: any) {
            console.error('Send OTP error:', error);
            if (error.code === 'auth/invalid-phone-number') {
                addToast('INVALID PHONE NUMBER');
            } else if (error.code === 'auth/too-many-requests') {
                addToast('TOO MANY REQUESTS • TRY AGAIN LATER');
            } else {
                addToast('ERROR • Failed to send OTP');
            }
            throw error;
        }
    };

    // Verify OTP Code
    const verifyOTP = async (code: string) => {
        if (!confirmationResult) {
            addToast('ERROR • OTP not sent yet');
            throw new Error('No confirmation result available');
        }
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED');
            return;
        }

        try {
            const user = await verifyOTPFirebase(confirmationResult, code);
            if (user) {
                addToast('PHONE VERIFIED • SIGNED IN');
                setConfirmationResult(null);
            }
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            if (error.code === 'auth/invalid-verification-code') {
                addToast('INVALID OTP • TRY AGAIN');
            } else if (error.code === 'auth/code-expired') {
                addToast('OTP EXPIRED • REQUEST NEW CODE');
            } else {
                addToast('ERROR • Failed to verify OTP');
            }
            throw error;
        }
    };

    // Sign Out
    const signOut = async () => {
        if (!isFirebaseConfigured) {
            setUser(null);
            setConfirmationResult(null);
            return;
        }
        try {
            await signOutFirebase();
            setUser(null);
            setConfirmationResult(null);
            addToast('SIGNED OUT');
        } catch (error: any) {
            console.error('Sign out error:', error);
            addToast('ERROR • Failed to sign out');
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signInWithGoogle,
                sendOTP,
                verifyOTP,
                signOut,
                confirmationResult,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;
