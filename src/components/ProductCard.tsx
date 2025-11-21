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
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: var(--white);
          border: 1px solid transparent;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-float);
          border-color: var(--black);
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
          transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
          filter: grayscale(100%);
        }
        
        .product-card:hover .product-image {
            transform: scale(1.1);
            filter: grayscale(0%);
        }

        .stock-badge-overlay {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          z-index: 2;
        }

        .product-info {
          padding: var(--space-lg);
          position: relative;
        }

        .product-name {
          font-size: 1.25rem;
          margin-bottom: var(--space-sm);
          text-transform: uppercase;
          line-height: 1.2;
          font-weight: 800;
        }

        .product-tags {
          flex-wrap: wrap;
        }

        .select-btn {
          width: 100%;
          padding: var(--space-md);
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: var(--border-thick) solid var(--black);
          background: var(--white);
          color: var(--black);
          transition: all 0.2s ease;
        }
        
        .select-btn.primary {
            background: var(--black);
            color: var(--white);
        }
        
        .select-btn:not(:disabled):hover {
            background: var(--primary);
            color: var(--black);
            border-color: var(--black);
            transform: translateY(-2px);
            box-shadow: 4px 4px 0 var(--black);
        }
        
        .select-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: var(--gray-light);
            border-color: var(--gray-mid);
            color: var(--gray-mid);
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
