// Home Page - Main Product Showcase
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import { subscribeToProducts } from '../firebase/products';
import type { Product } from '../types';
import '../index.css';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time product updates
  useEffect(() => {
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCategoryChange = (category: string, subcategory?: string) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory || '');
  };

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h2 className="hero-title display-text">
            STREET STYLE<br />
            <span className="highlight">POSTERS & STICKERS</span>
          </h2>
          <p className="hero-subtitle">
            Browse our collection • Select what you like • Stock updates in real-time
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container flex-center">
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        <div className="container">
          <div className="content-layout">
            {/* Sidebar Filter */}
            <aside className="sidebar">
              <CategoryFilter
                onCategoryChange={handleCategoryChange}
                activeCategory={activeCategory}
                activeSubcategory={activeSubcategory}
              />
            </aside>

            {/* Products Grid */}
            <main className="products-main">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-text">LOADING...</div>
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  searchTerm={searchTerm}
                  activeCategory={activeCategory}
                  activeSubcategory={activeSubcategory}
                />
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container text-center">
          <p className="footer-text">
            <strong>POSTRO</strong> © 2025 • Gen-Z Street Style • postro.in
          </p>
        </div>
      </footer>

      <style>{`
        .home-page {
          min-height: 100vh;
          background: var(--white);
        }

        .hero-section {
          background: var(--black);
          color: var(--white);
          padding: var(--space-3xl) 0;
          border-bottom: var(--border-chunky) solid var(--neon-pink);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 16, 240, 0.1) 10px,
            rgba(255, 16, 240, 0.1) 20px
          );
          pointer-events: none;
        }

        .hero-title {
          position: relative;
          z-index: 1;
          color: var(--white);
          text-align: center;
          margin-bottom: var(--space-lg);
        }

        .highlight {
          color: var(--neon-pink);
          text-shadow: 0 0 20px var(--neon-pink);
        }

        .hero-subtitle {
          position: relative;
          z-index: 1;
          text-align: center;
          font-size: 1.2rem;
          font-family: var(--font-body);
          color: var(--gray-light);
        }

        .search-section {
          background: var(--white);
          padding: var(--space-2xl) 0;
          border-bottom: var(--border-thin) solid var(--black);
        }

        .main-content {
          padding: var(--space-2xl) 0;
          min-height: 60vh;
        }

        .content-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-2xl);
          align-items: start;
        }

        .sidebar {
          position: sticky;
          top: calc(120px + var(--space-lg));
        }

        .products-main {
          min-height: 400px;
        }

        .site-footer {
          background: var(--gray-dark);
          color: var(--white);
          padding: var(--space-xl) 0;
          border-top: var(--border-thick) solid var(--neon-green);
          margin-top: var(--space-3xl);
        }

        .footer-text {
          font-family: var(--font-body);
          font-size: 1rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-text {
          font-family: var(--font-display);
          font-size: 3rem;
          color: var(--neon-pink);
          animation: pulse 1s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .content-layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
          }

          .hero-section {
            padding: var(--space-2xl) 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
