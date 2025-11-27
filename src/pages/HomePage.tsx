// Home Page - Main Product Showcase
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import HeroCarousel from '../components/HeroCarousel';
import Marquee from '../components/Marquee';
import CartDrawer from '../components/CartDrawer';
import { subscribeToProducts } from '../firebase/products';
import type { Product } from '../types';
import { readProductCache, writeProductCache } from '../utils/productCache';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'poster' | 'sticker'>('poster');
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate instantly from the last cached product snapshot
  useEffect(() => {
    const cachedProducts = readProductCache();
    if (cachedProducts && cachedProducts.length > 0) {
      setProducts(cachedProducts);
      setIsLoading(false);
    }
  }, []);

  // Subscribe to real-time product updates
  useEffect(() => {
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setIsLoading(false);
      writeProductCache(updatedProducts);
    });

    return () => unsubscribe();
  }, []);

  // Hero carousel slides
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80',
      title: 'CARS COLLECTION',
      subtitle: 'Garage-worthy prints for petrolheads • Precision-detailed • Ready to frame',
      cta: 'SHOP CARS'
    },
    {
      image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=1600&q=80',
      title: 'ANIME COLLECTION',
      subtitle: 'S-ranked posters for every shounen arc • Limited drops weekly',
      cta: 'SHOP ANIME'
    },
    {
      image: 'https://images.unsplash.com/photo-1463107971871-fbac9ddb920f?auto=format&fit=crop&w=1600&q=80',
      title: 'MOVIE COLLECTION',
      subtitle: 'Cinematic icons, remastered for your wall • Noir to neon palettes',
      cta: 'SHOP MOVIES'
    }
  ];

  // Filter products by type
  const filteredProducts = products.filter(product => product.type === productTypeFilter);

  return (
    <div className="min-h-screen bg-main text-dark overflow-x-hidden">
      <Navbar />

      <HeroCarousel slides={heroSlides} />
      <Marquee className="border-t-0" />

      <section className="border-b-[3px] border-dark bg-surface/70 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
          <div className="rounded-none border-[3px] border-dark bg-surface p-6 shadow-hard sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.45em] text-dark/50">SCAN THE STACK</p>
                <h3 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">FIND YOUR POSTER</h3>
              </div>
              <div className="w-full sm:max-w-md">
                <SearchBar onSearch={setSearchTerm} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.6em] text-dark/40">POSTRO SELECTION</p>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">ALL PRODUCTS</h2>
            <div className="flex w-full max-w-md flex-col gap-2 text-dark sm:flex-row sm:items-center sm:gap-3">
              <span className="h-[3px] flex-1 bg-dark" />
              <span className="text-xs font-bold uppercase tracking-[0.5em]">CURATED</span>
              <span className="h-[3px] flex-1 bg-dark" />
            </div>
          </div>

          {/* BRUTALIST TOGGLE SWITCHES */}
          <div className="flex w-full flex-wrap items-center justify-center gap-4 mb-8 max-w-2xl mx-auto max-[480px]:flex-col max-[480px]:px-2">
            {/* POSTERS BUTTON */}
            <button
              onClick={() => setProductTypeFilter('poster')}
              className={`
                relative px-4 sm:px-6 md:px-8 py-2 sm:py-3 font-display font-black uppercase text-base sm:text-lg border-[3px] border-dark transition-all duration-200 max-[480px]:w-full
                ${productTypeFilter === 'poster'
                  ? 'bg-primary text-dark shadow-[6px_6px_0px_0px_#0D0D0D] translate-x-[-2px] translate-y-[-2px]'
                  : 'bg-surface text-dark/50 hover:text-dark hover:shadow-[4px_4px_0px_0px_#0D0D0D] shadow-[0px_0px_0px_0px_#0D0D0D]'
                }
              `}
            >
              POSTERS
              {/* Active Indicator Dot */}
              {productTypeFilter === 'poster' && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF0099] border-2 border-dark rounded-none"></span>
              )}
            </button>
            <span className="font-display text-2xl font-black text-dark/20 max-[480px]:hidden">/</span>

            {/* STICKERS BUTTON */}
            <button
              onClick={() => setProductTypeFilter('sticker')}
              className={`
                relative px-4 sm:px-6 md:px-8 py-2 sm:py-3 font-display font-black uppercase text-base sm:text-lg border-[3px] border-dark transition-all duration-200 max-[480px]:w-full
                ${productTypeFilter === 'sticker'
                  ? 'bg-primary text-dark shadow-[6px_6px_0px_0px_#0D0D0D] translate-x-[-2px] translate-y-[-2px]'
                  : 'bg-surface text-dark/50 hover:text-dark hover:shadow-[4px_4px_0px_0px_#0D0D0D] shadow-[0px_0px_0px_0px_#0D0D0D]'
                }
              `}
            >
              STICKERS
              {productTypeFilter === 'sticker' && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF0099] border-2 border-dark rounded-none"></span>
              )}
            </button>
          </div>

          {/* RESULT COUNT TAG */}
          <div className="mb-6">
            <div className="inline-block bg-primary border-2 border-dark px-3 py-1 font-body font-bold text-xs shadow-[2px_2px_0px_0px_#0D0D0D] uppercase tracking-[0.3em]">
              SHOWING {filteredProducts.length} {productTypeFilter.toUpperCase()}S
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center border-[3px] border-dashed border-dark bg-surface text-center shadow-hard">
              <span className="font-display text-3xl uppercase tracking-tight text-dark/40">LOADING</span>
              <span className="text-xs font-bold uppercase tracking-[0.5em] text-dark/40">SYNCING INVENTORY</span>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              searchTerm={searchTerm}
              activeCategory=""
              activeSubcategory=""
            />
          )}
        </div>
      </section>

      <footer className="border-t-[3px] border-dark bg-dark py-8 text-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-xs font-bold uppercase tracking-[0.5em] sm:flex-row sm:justify-between sm:px-6 lg:px-0">
          <span>POSTRO © 2025</span>
          <span>STAY ACID • STAY BOLD</span>
          <span>POSTRO.IN</span>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
};

export default HomePage;
