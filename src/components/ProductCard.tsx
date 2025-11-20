// Product Card Component - Gen-Z Street Style
import React from 'react';
import type { Product } from '../types';
import StockBadge from './StockBadge';
import '../index.css';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const handleClick = () => {
    if (product.stock > 0) {
      onSelect(product);
    } else {
      alert('❌ SOLD OUT - This product is out of stock!');
    }
  };

  return (
    <div className="product-card card card-shadow animate-slide-up">
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        <div className="stock-badge-overlay">
          <StockBadge stock={product.stock} />
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {/* Tags */}
        <div className="product-tags flex gap-sm mt-sm">
          <span className="tag tag-accent">{product.type}</span>
          <span className="tag">{product.category}</span>
          {product.subcategory && (
            <span className="tag">{product.subcategory}</span>
          )}
        </div>

        {/* Select Button */}
        <button
          className={`select-btn mt-md ${product.stock === 0 ? '' : 'primary'}`}
          onClick={handleClick}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'SOLD OUT' : 'SELECT'}
        </button>
      </div>

      <style>{`
        .product-card {
          overflow: hidden;
          transition: transform 0.2s ease;
          background: var(--white);
        }

        .product-card:hover {
          transform: translateY(-4px);
        }

        .product-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: var(--gray-light);
          border-bottom: var(--border-thick) solid var(--black);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .stock-badge-overlay {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
        }

        .product-info {
          padding: var(--space-lg);
        }

        .product-name {
          font-size: 1.25rem;
          margin-bottom: var(--space-sm);
          text-transform: uppercase;
          line-height: 1.2;
        }

        .product-tags {
          flex-wrap: wrap;
        }

        .select-btn {
          width: 100%;
          padding: var(--space-md);
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
