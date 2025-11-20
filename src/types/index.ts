// Product types and interfaces

export interface Product {
    id: string;
    name: string;
    type: 'poster' | 'sticker';
    category: string;
    subcategory?: string;
    tags: string[];
    imageUrl: string;
    stock: number;
    createdAt: Date;
}

export interface Category {
    id: string;
    name: string;
    type: 'poster' | 'sticker';
    subcategories: string[];
}

export interface SaleLog {
    id: string;
    productId: string;
    productName: string;
    category: string;
    tags: string[];
    timestamp: Date;
    stockBefore: number;
    stockAfter: number;
}
