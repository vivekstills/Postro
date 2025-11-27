// Authentication Context - Global Auth State Management
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
    signOutUser as signOutFirebase,
    signUpWithEmailAndPassword as signUpEmailFirebase,
    signInWithEmailPassword as signInEmailFirebase,
    onAuthStateChange,
} from '../firebase/auth';
import { useToast } from '../components/ToastProvider';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUpWithEmail: (fullName: string, email: string, password: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
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

    const signUpWithEmail = async (fullName: string, email: string, password: string) => {
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED');
            return;
        }
        try {
            const trimmedName = fullName.trim();
            const user = await signUpEmailFirebase(email.trim(), password, trimmedName || undefined);
            setUser(user);
            addToast('ACCOUNT CREATED • WELCOME');
        } catch (error: any) {
            console.error('Email sign-up error:', error);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    addToast('EMAIL ALREADY REGISTERED');
                    break;
                case 'auth/weak-password':
                    addToast('PASSWORD TOO WEAK');
                    break;
                case 'auth/invalid-email':
                    addToast('INVALID EMAIL');
                    break;
                default:
                    addToast('ERROR • Failed to create account');
            }
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED');
            return;
        }
        try {
            const user = await signInEmailFirebase(email.trim(), password);
            setUser(user);
            addToast(`WELCOME BACK • ${user.email}`);
        } catch (error: any) {
            console.error('Email sign-in error:', error);
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    addToast('INVALID CREDENTIALS');
                    break;
                case 'auth/invalid-email':
                    addToast('INVALID EMAIL');
                    break;
                default:
                    addToast('ERROR • Failed to sign in');
            }
            throw error;
        }
    };

    // Sign Out
    const signOut = async () => {
        if (!isFirebaseConfigured) {
            setUser(null);
            return;
        }
        try {
            await signOutFirebase();
            setUser(null);
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
                signUpWithEmail,
                signInWithEmail,
                signOut,
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
