// Product Grid Component - Main Product Display with Filtering
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import { decreaseStock, getProduct } from '../firebase/products';
import { logSale } from '../firebase/salesLog';
import '../index.css';

interface ProductGridProps {
    products: Product[];
    searchTerm: string;
    activeCategory?: string;
    activeSubcategory?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    searchTerm,
    activeCategory,
    activeSubcategory
}) => {
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);


    // Filter products based on search and category
    useEffect(() => {
        let filtered = products;

        // Filter by search term
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(lowerSearch) ||
                product.tags.some(tag => tag.toLowerCase().includes(lowerSearch)) ||
                product.category.toLowerCase().includes(lowerSearch)
            );
        }

        // Filter by category
        if (activeCategory) {
            filtered = filtered.filter(product =>
                product.category === activeCategory
            );
        }

        // Filter by subcategory
        if (activeSubcategory) {
            filtered = filtered.filter(product =>
                product.subcategory === activeSubcategory
            );
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, activeCategory, activeSubcategory]);

    const handleProductSelect = async (product: Product) => {
        if (product.stock === 0) return;

        // Optimistic UI could go here, but for now we just fire and forget
        try {
            // Get current product data to ensure we have latest stock
            const currentProduct = await getProduct(product.id);
            if (!currentProduct || currentProduct.stock === 0) {
                alert('❌ Product is out of stock!');
                return;
            }

            // Decrease stock
            await decreaseStock(product.id);

            // Log the sale
            await logSale(
                product.id,
                product.name,
                product.category,
                product.tags,
                currentProduct.stock,
                currentProduct.stock - 1
            );

            // No alert, just silent success
            console.log(`Sold ${product.name}`);
        } catch (error) {
            console.error('Error selecting product:', error);
            // Keep error alert so they know if it failed
            alert('❌ ERROR: Failed to select product.');
        }
    };



    if (filteredProducts.length === 0) {
        return (
            <div className="empty-state">
                <h2>NO PRODUCTS FOUND</h2>
                <p>Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div className="product-grid-container">
            <div className="products-count">
                <span className="tag tag-accent">{filteredProducts.length} PRODUCTS</span>
            </div>

            <div className="product-grid grid grid-4 gap-lg mt-lg">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={handleProductSelect}
                    />
                ))}
            </div>

            <style>{`
        .product-grid-container {
          width: 100%;
        }

        .products-count {
          display: flex;
          justify-content: flex-start;
          margin-bottom: var(--space-md);
        }

        .product-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

        .empty-state {
          text-align: center;
          padding: var(--space-3xl);
          background: var(--white);
          border: var(--border-thick) solid var(--black);
        }

        .empty-state h2 {
          margin-bottom: var(--space-md);
          color: var(--gray-dark);
        }

        .empty-state p {
          color: var(--gray-mid);
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--space-md);
          }
        }
      `}</style>
        </div>
    );
};

export default ProductGrid;
