// Home Page - Main Product Showcase
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import HeroCarousel from '../components/HeroCarousel';
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

  // Hero carousel slides
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      title: 'STREET ART POSTERS',
      subtitle: 'Bold designs for your space • Premium quality • Fresh drops weekly',
      cta: 'SHOP NOW'
    },
    {
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
      title: 'ANIME COLLECTION',
      subtitle: 'Naruto, JJK, One Piece & more • Limited editions available',
      cta: 'EXPLORE'
    },
    {
      image: 'https://images.unsplash.com/photo-1514897575457-c4db467cf78e?w=1200',
      title: 'MOVIE CLASSICS',
      subtitle: 'Iconic film posters • Retro & modern styles • Canvas & paper',
      cta: 'VIEW ALL'
    }
  ];

  return (
    <div className="home-page">
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        <div className="container">
          <h2 className="section-heading">
            <span className="heading-line"></span>
            <span className="heading-text">ALL PRODUCTS</span>
            <span className="heading-line"></span>
          </h2>

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

        .search-section {
          background: var(--white);
          padding: var(--space-2xl) 0;
          border-bottom: var(--border-thin) solid rgba(0,0,0,0.1);
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: var(--space-3xl) 0 var(--space-2xl);
          gap: var(--space-lg);
        }

        .heading-line {
          flex: 1;
          height: var(--border-thick);
          background: var(--black);
          max-width: 200px;
        }

        .heading-text {
          font-family: var(--font-display);
          font-size: 2.5rem;
          letter-spacing: 0.05em;
          color: var(--black);
          padding: 0 var(--space-md);
          position: relative;
        }

        .heading-text::before {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 4px;
          background: var(--primary);
        }

        .main-content {
          padding-bottom: var(--space-3xl);
        }

        .content-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-2xl);
          align-items: start;
        }

        .sidebar {
          position: sticky;
          top: calc(100px + var(--space-lg));
        }

        .products-main {
          min-height: 400px;
        }

        .site-footer {
          background: var(--black);
          color: var(--white);
          padding: var(--space-2xl) 0;
          border-top: var(--border-chunky) solid var(--primary);
        }

        .footer-text {
          font-family: var(--font-body);
          font-size: 0.9rem;
          opacity: 0.8;
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
          color: var(--primary);
          animation: pulse 1s ease-in-out infinite;
        }

        @media (max-width: 900px) {
          .section-heading {
            margin: var(--space-2xl) 0 var(--space-xl);
          }

          .heading-line {
            max-width: 100px;
          }

          .heading-text {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .content-layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
            margin-bottom: var(--space-xl);
          }

          .section-heading {
            flex-direction: column;
            gap: var(--space-sm);
          }

          .heading-line {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
