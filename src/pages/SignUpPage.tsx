// Sign-Up Page - Brutalist Authentication UI
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../index.css';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, signInWithGoogle, sendOTP, verifyOTP, confirmationResult } = useAuth();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
    const [isLoadingPhone, setIsLoadingPhone] = useState(false);
    const [isLoadingOTP, setIsLoadingOTP] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    // Redirect if already signed in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    // OTP Timer countdown
    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [otpTimer]);

    const handleGoogleSignIn = async () => {
        setIsLoadingGoogle(true);
        try {
            await signInWithGoogle();
            // Navigation happens automatically via useEffect
        } catch (error) {
            console.error('Google sign-in failed:', error);
        } finally {
            setIsLoadingGoogle(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingPhone(true);
        try {
            await sendOTP(phoneNumber);
            setOtpTimer(60); // Start 60-second countdown
        } catch (error) {
            console.error('Send OTP failed:', error);
        } finally {
            setIsLoadingPhone(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingOTP(true);
        try {
            await verifyOTP(otpCode);
            // Navigation happens automatically via useEffect
        } catch (error) {
            console.error('Verify OTP failed:', error);
        } finally {
            setIsLoadingOTP(false);
        }
    };

    return (
        <div className="min-h-screen bg-main text-dark">
            <Header />

            <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
                <div className="w-full max-w-md border-[3px] border-dark bg-surface p-8 shadow-hard">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.5em] text-dark/40">
                            JOIN THE STACK
                        </p>
                        <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-dark">
                            SIGN UP
                        </h2>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoadingGoogle}
                        className="group mb-6 w-full border-[3px] border-dark bg-white py-4 font-display font-bold uppercase tracking-tight shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000]"
                    >
                        <span className="flex items-center justify-center gap-3">
                            {isLoadingGoogle ? (
                                <span>SIGNING IN...</span>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    SIGN IN WITH GOOGLE
                                </>
                            )}
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="mb-6 flex items-center gap-3">
                        <span className="h-[3px] flex-1 bg-dark" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-dark/40">
                            OR
                        </span>
                        <span className="h-[3px] flex-1 bg-dark" />
                    </div>

                    {/* Phone Sign-In Form */}
                    {!confirmationResult ? (
                        <form onSubmit={handleSendOTP}>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-dark/60">
                                PHONE NUMBER
                            </label>
                            <input
                                type="tel"
                                placeholder="+1 234 567 8900"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="mb-4 w-full border-[3px] border-dark bg-main px-4 py-3 font-body font-semibold tracking-wide text-dark transition-all focus:bg-white focus:outline-none"
                                required
                                disabled={isLoadingPhone}
                            />
                            <p className="mb-4 text-xs text-dark/50">
                                💡 Include country code (e.g., +1 for USA, +91 for India)
                            </p>

                            {/* reCAPTCHA Container */}
                            <div id="recaptcha-container" className="mb-4"></div>

                            <button
                                type="submit"
                                disabled={isLoadingPhone}
                                className="w-full border-[3px] border-dark bg-primary py-4 font-display font-black uppercase tracking-tight text-dark shadow-[6px_6px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_#000]"
                            >
                                {isLoadingPhone ? 'SENDING OTP...' : 'SEND OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-dark/60">
                                ENTER OTP CODE
                            </label>
                            <input
                                type="text"
                                placeholder="123456"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                className="mb-4 w-full border-[3px] border-dark bg-main px-4 py-3 text-center font-display text-2xl font-bold tracking-[0.3em] text-dark transition-all focus:bg-white focus:outline-none"
                                required
                                maxLength={6}
                                disabled={isLoadingOTP}
                                autoFocus
                            />

                            {/* Timer Display */}
                            {otpTimer > 0 && (
                                <div className="mb-4 text-center">
                                    <span className="inline-block border-2 border-dark bg-black px-3 py-1 font-display text-sm font-bold text-primary">
                                        OTP EXPIRES IN: {otpTimer}s
                                    </span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoadingOTP}
                                className="mb-4 w-full border-[3px] border-dark bg-[#FF0099] py-4 font-display font-black uppercase tracking-tight text-white shadow-[6px_6px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-black hover:text-primary hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_#000]"
                            >
                                {isLoadingOTP ? 'VERIFYING...' : 'VERIFY OTP'}
                            </button>

                            {/* Resend OTP */}
                            <button
                                type="button"
                                onClick={() => {
                                    setOtpCode('');
                                    handleSendOTP(new Event('submit') as any);
                                }}
                                disabled={otpTimer > 0 || isLoadingPhone}
                                className="w-full border-[3px] border-dark bg-surface py-3 font-body font-bold uppercase tracking-wide text-dark transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                RESEND OTP
                            </button>
                        </form>
                    )}

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
