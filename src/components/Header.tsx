import { AnimatePresence, motion, type Transition } from 'framer-motion';
import clsx from 'clsx';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'HOME', to: '/' },
  { label: 'ADMIN', to: '/admin' },
  { label: 'SIGN IN', to: '/signup' },
];

const spring: Transition = { type: 'spring', stiffness: 400, damping: 25 };

const Header: FC = () => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-[3px] border-dark bg-main/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <motion.button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-none border-[3px] border-dark bg-surface shadow-hard md:hidden"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
            whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0px 0px #0D0D0D' }}
            whileTap={{ x: 0, y: 0, boxShadow: '0px 0px 0px 0px #0D0D0D' }}
            transition={spring}
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-[3px] w-6 bg-dark" />
              <span className="h-[3px] w-6 bg-dark" />
              <span className="h-[3px] w-6 bg-dark" />
            </span>
          </motion.button>

          <Link to="/" className="flex items-center gap-4 text-dark">
            <motion.img
              src="/postro-logo.jpg"
              alt="POSTRO"
              className="h-10 w-10 rounded-none border-[3px] border-dark object-cover shadow-hard"
              whileHover={{ scale: 1.05, rotate: -2, x: -4, y: -4, boxShadow: '8px 8px 0px 0px #0D0D0D' }}
              whileTap={{ scale: 1, rotate: 0, x: 0, y: 0, boxShadow: '0px 0px 0px 0px #0D0D0D' }}
              transition={spring}
            />
            <span className="hidden font-display text-xl font-black uppercase tracking-tight sm:inline-flex">Postro</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ label, to }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative overflow-hidden px-2 py-1 text-sm font-black uppercase tracking-[0.2em]"
                >
                  <motion.span
                    className="absolute inset-0 -z-10 bg-primary"
                    initial={{ scaleX: isActive ? 1 : 0 }}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={spring}
                    style={{ originX: 0 }}
                  />
                  <span className={clsx('relative z-10', isActive ? 'text-dark' : 'text-dark/60')}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              type="button"
              className="absolute inset-0 bg-dark/70"
              aria-label="Close menu overlay"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className="relative flex h-full flex-col justify-between bg-dark px-6 py-8 text-primary sm:px-10 sm:py-12"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={spring}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl uppercase tracking-[0.3em]">Menu</span>
                <motion.button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-none border-[3px] border-primary text-primary"
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                >
                  ✕
                </motion.button>
              </div>

              <motion.ul
                className="flex flex-col gap-6 text-[3.5rem] font-black uppercase leading-[0.9] tracking-tight sm:text-[4rem]"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  visible: { transition: { staggerChildren: 0.08 } },
                  hidden: {},
                }}
              >
                {navLinks.map(({ label, to }) => (
                  <motion.li
                    key={`${label}-${to}`}
                    variants={{
                      hidden: { y: '100%', opacity: 0 },
                      visible: { y: 0, opacity: 1 },
                    }}
                  >
                    <Link
                      to={to}
                      className="block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.5em] text-primary/60">
                <span>STREET-CODE</span>
                <span>© POSTRO 2025</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
