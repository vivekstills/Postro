import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { setIsCartOpen, cartItemCount } = useCart();
    const { user, signOut } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);

    const userInitials = useMemo(() => {
        if (!user) return '';
        const displayName = user.displayName?.trim();
        if (displayName) {
            const parts = displayName.split(/\s+/).filter(Boolean);
            const first = parts[0]?.[0];
            const last = parts[parts.length - 1]?.[0] ?? first;
            if (first && last) {
                return `${first}${last}`.toUpperCase();
            }
        }

        const emailName = user.email?.split('@')[0]?.replace(/[^a-zA-Z]/g, '') ?? '';
        if (emailName.length >= 2) {
            return `${emailName[0]}${emailName[emailName.length - 1]}`.toUpperCase();
        }
        if (emailName.length === 1) {
            return `${emailName[0]}${emailName[0]}`.toUpperCase();
        }

        return user.uid.slice(0, 2).toUpperCase();
    }, [user]);

    useEffect(() => {
        if (!isUserMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    return (
        <>
            {/* --- MAIN NAVBAR --- */}
            <nav className="sticky top-0 z-40 w-full border-b-[3px] border-black/70 bg-[#F4F4F0]/85 px-4 py-3 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-md supports-[backdrop-filter]:bg-white/55 supports-[backdrop-filter]:backdrop-blur-2xl max-[480px]:px-3 max-[480px]:py-2.5">
                <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 max-[480px]:gap-2">

                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 max-[480px]:w-full max-[480px]:justify-between max-[480px]:gap-2">
                        {/* HAMBURGER BUTTON (Left of Logo) */}
                        <button
                            onClick={toggleMenu}
                            className="group flex flex-col gap-1.5 p-2 border-2 border-transparent hover:border-black transition-all hover:bg-[#CCFF00] hover:shadow-[4px_4px_0px_0px_#000]"
                        >
                            <span className="block w-8 h-[3px] bg-black group-hover:rotate-12 transition-transform origin-left"></span>
                            <span className="block w-8 h-[3px] bg-black"></span>
                            <span className="block w-8 h-[3px] bg-black group-hover:-rotate-12 transition-transform origin-left"></span>
                        </button>

                        {/* LOGO */}
                        <Link to="/" aria-label="Postro home" className="flex items-center select-none cursor-pointer">
                            <div className="bg-black text-white px-3 py-1 font-[Unbounded] font-black text-lg tracking-tight transform -rotate-2 max-[480px]:text-base sm:text-xl">
                                postro
                            </div>
                        </Link>
                    </div>

                    {/* RIGHT SIDE ACTIONS (Auth, Cart, etc.) */}
                    <div className="flex items-center gap-2 sm:gap-3 max-[480px]:flex-shrink-0 max-[480px]:justify-end">
                        {/* Authentication UI */}
                        {user ? (
                            <div className="relative hidden sm:flex items-center" ref={userMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                    aria-haspopup="menu"
                                    aria-expanded={isUserMenuOpen}
                                    className="flex h-[56px] w-[56px] items-center justify-center border-[3px] border-black bg-[#0D0D0D] font-[Unbounded] text-xl font-black uppercase tracking-tight text-[#CCFF00] shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]"
                                >
                                    {userInitials}
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-[calc(100%+12px)] z-50 min-w-[180px] border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_#000]">
                                        <div className="border-b-[3px] border-black bg-[#F4F4F0] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-dark/60">
                                            {user.email}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await signOut();
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left font-[Space_Grotesk] text-sm font-bold uppercase tracking-[0.2em] text-dark transition-all hover:bg-black hover:text-[#CCFF00]"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/signup"
                                className="hidden sm:flex h-[56px] items-center justify-center bg-primary border-[3px] border-black px-5 font-[Space_Grotesk] font-bold text-sm hover:bg-black hover:text-[#CCFF00] transition-all shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]"
                            >
                                SIGN IN
                            </Link>
                        )}

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            aria-label="Open cart"
                            className="group relative flex h-[52px] w-[52px] items-center justify-center rounded-none bg-white border-[3px] border-black text-black p-0 hover:bg-[#CCFF00] hover:border-black transition-all shadow-[4px_4px_0px_0px_#000] hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] max-[480px]:h-[48px] max-[480px]:w-[48px] sm:h-[56px] sm:w-[56px]"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                className="h-8 w-8 sm:h-9 sm:w-9 transition-transform group-hover:scale-[1.05]"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5.2 6h1.9l2.5 9.5h8.8L20 7.8H7.6"
                                    fill="none"
                                    stroke="#0B0B0B"
                                    strokeWidth="2.6"
                                    strokeLinecap="round"
                                />
                                <circle cx="11" cy="20" r="2" fill="#0B0B0B" />
                                <circle cx="19" cy="20" r="2" fill="#0B0B0B" />
                                <rect x="4" y="4" width="3.5" height="2.5" fill="#0B0B0B" rx="0.5" />
                            </svg>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#FF0099] text-white text-xs font-[Unbounded] font-bold px-1.5 py-0.5 border-2 border-black min-w-[22px] text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- SLIDE-OUT SIDEBAR (OVERLAY) --- */}
            {/* Dark Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleMenu}
            />

            {/* Sidebar Content */}
            <div className={`fixed top-0 left-0 h-full w-full max-w-[320px] sm:max-w-[360px] bg-[#F4F4F0] border-r-[3px] border-black z-50 transform transition-transform duration-300 ease-out shadow-[10px_0px_0px_0px_rgba(0,0,0,1)] ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>

                {/* Close Button */}
                <div className="p-4 flex justify-end flex-shrink-0">
                    <button onClick={toggleMenu} className="p-2 border-2 border-black hover:bg-[#FF0099] hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* CATEGORIES SECTION */}
                <div className="flex-1 px-6 pb-10 pt-2 sm:pt-4 overflow-y-auto overflow-x-hidden">
                    <h2 className="font-[Unbounded] text-3xl font-black uppercase mb-2">Categories</h2>
                    <div className="w-full h-[3px] bg-black mb-6"></div>

                    <ul className="flex flex-col gap-4">
                        {['ALL PRODUCTS', 'ANIME POSTERS+', 'MOVIE POSTERS+', 'CAR POSTERS+', 'BIKE POSTERS+', 'STICKERS+'].map((category, index) => (
                            <li key={index}>
                                <button
                                    className={`w-full text-left px-4 py-3 font-[Unbounded] font-bold uppercase border-[3px] border-black text-sm tracking-wide transition-all
                      ${index === 0 ? 'bg-[#CCFF00] shadow-[5px_5px_0px_0px_#000] hover:translate-x-1' : 'bg-white shadow-[3px_3px_0px_0px_#000] hover:bg-[#CCFF00] hover:translate-x-1 hover:shadow-[5px_5px_0px_0px_#000]'}
                    `}
                                >
                                    {category}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 space-y-3">
                        {user ? (
                            <>
                                <div className="border-[3px] border-black bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.3em]">
                                    {user.displayName || user.email || 'SIGNED IN'}
                                </div>
                                <button
                                    onClick={signOut}
                                    className="w-full border-[3px] border-black bg-[#FF0099] py-3 font-[Unbounded] text-sm font-black uppercase tracking-[0.3em] text-white shadow-[4px_4px_0px_0px_#000] hover:bg-black hover:text-[#CCFF00]"
                                >
                                    SIGN OUT
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/signup"
                                onClick={toggleMenu}
                                className="block w-full border-[3px] border-black bg-primary px-4 py-3 text-center font-[Unbounded] text-sm font-black uppercase tracking-[0.3em] text-dark shadow-[4px_4px_0px_0px_#000] hover:bg-black hover:text-[#CCFF00]"
                            >
                                SIGN IN / JOIN
                            </Link>
                        )}
                    </div>

                    <div className="mt-12 p-4 border-2 border-black bg-black text-white text-center">
                        <p className="font-[Space_Grotesk] text-xs uppercase mb-2">Street Art for Your Walls</p>
                        <p className="font-[Unbounded] text-yellow-400">© 2024 POSTRO</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
