// Category Filter Component - Multi-level Navigation
import React, { useState } from 'react';
import '../index.css';

interface CategoryOption {
    name: string;
    subcategories?: string[];
}

interface CategoryFilterProps {
    onCategoryChange: (category: string, subcategory?: string) => void;
    activeCategory?: string;
    activeSubcategory?: string;
}

const categories: CategoryOption[] = [
    {
        name: 'Anime Posters',
        subcategories: ['Naruto', 'Jujutsu Kaisen', 'One Punch Man', 'Death Note', 'Demon Slayer', 'Attack on Titan']
    },
    {
        name: 'Movie Posters',
        subcategories: ['Marvel', 'DC', 'Horror', 'Action', 'Sci-Fi', 'Classic']
    },
    {
        name: 'Car Posters',
        subcategories: ['JDM', 'Supercars', 'Classic Cars', 'F1']
    },
    {
        name: 'Bike Posters',
        subcategories: ['Sports Bikes', 'Cruisers', 'Racing']
    },
    {
        name: 'Stickers',
        subcategories: ['Sarcastic', 'Anime', 'Quotes', 'Minimal']
    }
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    onCategoryChange,
    activeCategory,
    activeSubcategory
}) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const toggleCategory = (categoryName: string) => {
        if (expandedCategory === categoryName) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categoryName);
        }
    };

    const handleCategoryClick = (categoryName: string) => {
        onCategoryChange(categoryName);
        toggleCategory(categoryName);
    };

    const handleSubcategoryClick = (categoryName: string, subcategory: string) => {
        onCategoryChange(categoryName, subcategory);
    };

    const handleShowAll = () => {
        onCategoryChange('');
        setExpandedCategory(null);
    };

    return (
        <div className="category-filter">
            <h3 className="filter-title">CATEGORIES</h3>

            {/* Show All Button */}
            <button
                className={`category-btn ${!activeCategory ? 'active' : ''}`}
                onClick={handleShowAll}
            >
                <span>ALL PRODUCTS</span>
            </button>

            {/* Category List */}
            {categories.map((category) => (
                <div key={category.name} className="category-group">
                    <button
                        className={`category-btn ${activeCategory === category.name && !activeSubcategory ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category.name)}
                    >
                        <span>{category.name}</span>
                        {category.subcategories && (
                            <span className="expand-icon">
                                {expandedCategory === category.name ? '−' : '+'}
                            </span>
                        )}
                    </button>

                    {/* Subcategories */}
                    {expandedCategory === category.name && category.subcategories && (
                        <div className="subcategories">
                            {category.subcategories.map((sub) => (
                                <button
                                    key={sub}
                                    className={`subcategory-btn ${activeSubcategory === sub ? 'active' : ''}`}
                                    onClick={() => handleSubcategoryClick(category.name, sub)}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <style>{`
        .category-filter {
          background: var(--white);
          border: var(--border-thick) solid var(--black);
          padding: var(--space-lg);
          min-width: 250px;
          max-width: 300px;
          box-shadow: var(--shadow-card);
        }

        .filter-title {
          font-size: 1.5rem;
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-md);
          border-bottom: var(--border-thick) solid var(--black);
        }

        .category-group {
          margin-bottom: var(--space-sm);
        }

        .category-btn {
          width: 100%;
          text-align: left;
          padding: var(--space-md);
          background: var(--white);
          border: var(--border-thin) solid var(--black);
          font-family: var(--font-heading);
          font-size: 0.9rem;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          margin-bottom: var(--space-xs);
          transition: all 0.15s ease;
        }

        .category-btn:hover {
          background: rgba(64, 188, 216, 0.05);
          color: var(--primary);
          transform: translateX(4px);
          border-color: var(--primary);
        }

        .category-btn.active {
          background: var(--black);
          color: var(--white);
          border-color: var(--black);
        }

        .expand-icon {
          font-family: monospace;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .subcategories {
          padding-left: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .subcategory-btn {
          width: 100%;
          text-align: left;
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          border-left: 2px solid var(--gray-light);
          font-family: var(--font-body);
          font-size: 0.85rem;
          text-transform: uppercase;
          cursor: pointer;
          margin-bottom: var(--space-xs);
          transition: all 0.15s ease;
        }

        .subcategory-btn:hover {
          border-left-color: var(--primary);
          padding-left: calc(var(--space-md) + 4px);
          color: var(--primary);
        }

        .subcategory-btn.active {
          color: var(--black);
          font-weight: 700;
          border-left-color: var(--primary);
          background: rgba(64, 188, 216, 0.1);
        }

        @media (max-width: 768px) {
          .category-filter {
            max-width: 100%;
            margin-bottom: var(--space-lg);
          }
        }
      `}</style>
        </div>
    );
};

export default CategoryFilter;
