// Header Component - Neo-Brutalist Navigation with Hamburger Menu
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryFilter from './CategoryFilter';
import '../index.css';

interface HeaderProps {
  onCategoryChange?: (category: string, subcategory?: string) => void;
  activeCategory?: string;
  activeSubcategory?: string;
}

const Header: React.FC<HeaderProps> = ({ onCategoryChange, activeCategory, activeSubcategory }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCategoryChange = (category: string, subcategory?: string) => {
    if (onCategoryChange) {
      onCategoryChange(category, subcategory);
    }
    // Close menu on mobile after selection
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="header-content container">
          {/* Hamburger Menu Button */}
          <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Logo - Now using image */}
          <Link to="/" className="logo-link">
            <img src="/postro-logo.jpg" alt="POSTRO" className="logo-image" />
          </Link>

          {/* Navigation */}
          <nav className="nav-links">
            <Link to="/" className="nav-link">HOME</Link>
            <Link to="/admin" className="nav-link admin-link">
              <span className="tag tag-accent">ADMIN</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={toggleMenu}></div>
      )}

      {/* Slide-out Menu */}
      <div className={`slide-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="slide-menu-header">
          <h2 className="menu-title">CATEGORIES</h2>
          <button className="close-btn" onClick={toggleMenu}>✕</button>
        </div>
        <div className="slide-menu-content">
          <CategoryFilter
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      <style>{`
        .site-header {
          background: var(--primary); /* Acid Green */
          color: var(--black);
          padding: var(--space-xs) 0;
          border-bottom: var(--border-thick) solid var(--black);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-lg);
        }

        /* Hamburger Button */
        .hamburger-btn {
          background: transparent;
          border: none;
          padding: var(--space-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        }

        .hamburger-icon {
          width: 30px;
          height: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger-icon span {
          display: block;
          width: 100%;
          height: 3px;
          background: var(--black);
          transition: all 0.3s ease;
        }

        .hamburger-icon.open span:nth-child(1) {
          transform: rotate(45deg) translateY(10px);
        }

        .hamburger-icon.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger-icon.open span:nth-child(3) {
          transform: rotate(-45deg) translateY(-10px);
        }

        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          flex: 1;
        }

        .logo-image {
          height: 35px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .nav-links {
          display: flex;
          gap: var(--space-lg);
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: var(--black);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          transform: translateY(-2px);
        }

        .admin-link .tag {
          cursor: pointer;
        }

        /* Menu Overlay */
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1001;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Slide-out Menu */
        .slide-menu {
          position: fixed;
          top: 0;
          left: -320px;
          width: 320px;
          height: 100vh;
          background: var(--white);
          border-right: var(--border-thick) solid var(--black);
          box-shadow: var(--shadow-float);
          z-index: 1002;
          transition: left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          overflow-y: auto;
        }

        .slide-menu.open {
          left: 0;
        }

        .slide-menu-header {
          background: var(--black);
          color: var(--primary);
          padding: var(--space-lg);
          border-bottom: var(--border-thick) solid var(--black);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .menu-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          margin: 0;
          letter-spacing: 0.05em;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .close-btn:hover {
          transform: rotate(90deg);
        }

        .slide-menu-content {
          padding: var(--space-lg);
        }

        @media (max-width: 768px) {
          .logo-image {
            height: 28px;
          }

          .nav-links {
            gap: var(--space-sm);
          }

          .nav-link {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
