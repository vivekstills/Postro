// Sign-Up Page - Brutalist Authentication UI
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../index.css';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        user,
        signUpWithEmail,
        signInWithEmail
    } = useAuth();

    const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    // Redirect if already signed in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoadingEmail) return;
        setEmailError(null);

        if (!email.trim() || !password.trim()) {
            setEmailError('Email and password are required.');
            return;
        }

        if (authMode === 'signup' && password !== confirmPassword) {
            setEmailError('Passwords do not match.');
            return;
        }

        setIsLoadingEmail(true);
        try {
            if (authMode === 'signup') {
                await signUpWithEmail(fullName, email, password);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (error) {
            console.error('Email auth failed:', error);
        } finally {
            setIsLoadingEmail(false);
        }
    };

    const toggleMode = (mode: 'signup' | 'signin') => {
        setAuthMode(mode);
        setEmailError(null);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-main text-dark">
            <Header />

            <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
                <div className="w-full max-w-md border-[3px] border-dark bg-surface p-6 sm:p-8 shadow-hard">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-[0.45em] text-dark/40">
                            JOIN THE STACK
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-dark sm:text-4xl">
                            SIGN UP
                        </h2>
                    </div>

                    {/* Email Auth */}
                    <div className="mb-6">
                        <div className="mb-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => toggleMode('signup')}
                                className={`border-[3px] border-dark py-3 font-display text-sm font-black uppercase tracking-[0.2em] transition-all ${authMode === 'signup'
                                    ? 'bg-primary text-dark shadow-[4px_4px_0px_0px_#000]'
                                    : 'bg-white text-dark/60 hover:bg-primary/70'}`}
                            >
                                CREATE ACCOUNT
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleMode('signin')}
                                className={`border-[3px] border-dark py-3 font-display text-sm font-black uppercase tracking-[0.2em] transition-all ${authMode === 'signin'
                                    ? 'bg-primary text-dark shadow-[4px_4px_0px_0px_#000]'
                                    : 'bg-white text-dark/60 hover:bg-primary/70'}`}
                            >
                                SIGN IN
                            </button>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            {authMode === 'signup' && (
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-dark/60">
                                        FULL NAME
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="POSTRO FAN"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full border-[3px] border-dark bg-main px-4 py-3 font-body font-semibold tracking-wide text-dark transition-all focus:bg-white focus:outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-dark/60">
                                    EMAIL
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border-[3px] border-dark bg-main px-4 py-3 font-body font-semibold tracking-wide text-dark transition-all focus:bg-white focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-dark/60">
                                    PASSWORD
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-[3px] border-dark bg-main px-4 py-3 font-body font-semibold tracking-wide text-dark transition-all focus:bg-white focus:outline-none"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {authMode === 'signup' && (
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-dark/60">
                                        CONFIRM PASSWORD
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border-[3px] border-dark bg-main px-4 py-3 font-body font-semibold tracking-wide text-dark transition-all focus:bg-white focus:outline-none"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}

                            {emailError && (
                                <div className="rounded-none border-[3px] border-black bg-[#FFE5E5] px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B00020]">
                                    {emailError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoadingEmail}
                                className="w-full border-[3px] border-dark bg-[#FF0099] py-4 font-display font-black uppercase tracking-tight text-white shadow-[6px_6px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-black hover:text-primary hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_#000]"
                            >
                                {isLoadingEmail
                                    ? 'Processing...'
                                    : authMode === 'signup'
                                        ? 'Create Account'
                                        : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    {/* Back to Home */}
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 w-full border-[3px] border-transparent py-3 font-body font-bold uppercase tracking-wide text-dark/50 transition-all hover:border-dark hover:bg-white"
                    >
                        ← BACK TO HOME
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
