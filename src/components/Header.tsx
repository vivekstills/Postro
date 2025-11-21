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
          background: var(--white);
          color: var(--black);
          padding: var(--space-md) 0;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
          background: rgba(252, 247, 248, 0.95);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .logo {
          color: var(--black);
          margin: 0;
          font-family: var(--font-heading);
          font-size: clamp(1.5rem, 4vw, 2rem);
          letter-spacing: -0.02em;
          font-weight: 800;
          transition: all 0.3s ease;
          position: relative;
          display: inline-block;
        }

        /* Subtle Logo Animation */
        .logo::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .logo:hover {
          color: var(--primary);
          transform: translateY(-1px);
        }

        .logo:hover::after {
          width: 100%;
        }

        .nav-links {
          display: flex;
          gap: var(--space-lg);
          align-items: center;
        }

        .nav-link {
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--gray-mid);
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--black);
        }

        .admin-link .tag {
          background: var(--black);
          color: var(--white);
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.7rem;
          transition: all 0.2s ease;
        }
        
        .admin-link:hover .tag {
          background: var(--primary);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .header-content {
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
