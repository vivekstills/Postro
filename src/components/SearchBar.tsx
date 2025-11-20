// Search Bar Component - Street Style
import React, { useState, useEffect } from 'react';
import '../index.css';

interface SearchBarProps {
    onSearch: (searchTerm: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "SEARCH POSTERS & STICKERS..."
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const debounce = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, onSearch]);

    return (
        <div className="search-bar-container">
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>

            <style>{`
        .search-bar-container {
          position: relative;
          width: 100%;
          max-width: 600px;
        }

        .search-input {
          width: 100%;
          padding: var(--space-md) var(--space-3xl) var(--space-md) var(--space-md);
          border: var(--border-thick) solid var(--black);
          background: var(--white);
          font-family: var(--font-heading);
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .search-input::placeholder {
          color: var(--gray-mid);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--neon-pink);
          box-shadow: 4px 4px 0 var(--neon-pink);
        }

        .search-icon {
          position: absolute;
          right: var(--space-md);
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default SearchBar;
