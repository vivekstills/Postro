// Stock Badge Component - Street Style Status Indicator
import React from 'react';
import '../index.css';

interface StockBadgeProps {
    stock: number;
    lowStockThreshold?: number;
}

const StockBadge: React.FC<StockBadgeProps> = ({ stock, lowStockThreshold = 5 }) => {
    const getStockStatus = () => {
        if (stock === 0) return { text: 'SOLD OUT', className: 'tag-orange' };
        if (stock <= lowStockThreshold) return { text: `${stock} LEFT`, className: 'tag-yellow' };
        return { text: `${stock} IN STOCK`, className: 'tag-green' };
    };

    const status = getStockStatus();

    return (
        <span className={`tag ${status.className}`}>
            {status.text}
        </span>
    );
};

export default StockBadge;
