// Header Component - Street Style Navigation
import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

interface HeaderProps {
    onSearch?: (searchTerm: string) => void;
}

const Header: React.FC<HeaderProps> = () => {
    return (
        <header className="site-header">
            <div className="header-content container">
                {/* Logo */}
                <Link to="/" className="logo-link">
                    <h1 className="logo display-text">POSTRO</h1>
                </Link>

                {/* Navigation */}
                <nav className="nav-links">
                    <Link to="/" className="nav-link">HOME</Link>
                    <Link to="/admin" className="nav-link admin-link">
                        <span className="tag tag-accent">ADMIN</span>
                    </Link>
                </nav>
            </div>

            <style>{`
        .site-header {
          background: var(--black);
          color: var(--white);
          padding: var(--space-lg) 0;
          border-bottom: var(--border-chunky) solid var(--neon-pink);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 8px 0 var(--neon-pink);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-link {
          text-decoration: none;
        }

        .logo {
          color: var(--neon-pink);
          margin: 0;
          font-size: clamp(2rem, 5vw, 3.5rem);
          letter-spacing: 0.1em;
          text-shadow: 4px 4px 0 var(--white);
          transition: all 0.2s ease;
        }

        .logo:hover {
          transform: scale(1.05);
          text-shadow: 6px 6px 0 var(--neon-green);
        }

        .nav-links {
          display: flex;
          gap: var(--space-xl);
          align-items: center;
        }

        .nav-link {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--white);
          text-decoration: none;
          transition: all 0.15s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--neon-pink);
          transform: translateY(-2px);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: var(--border-thin);
          background: var(--neon-pink);
          transition: width 0.2s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .admin-link .tag {
          animation: pulse 2s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: var(--space-md);
          }

          .nav-links {
            gap: var(--space-md);
          }
        }
      `}</style>
        </header>
    );
};

export default Header;
