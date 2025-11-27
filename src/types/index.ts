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
    price: number;
    createdAt?: Date | null;
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

export interface CartItem {
    productId: string;
    productName: string;
    productType: 'poster' | 'sticker';
    imageUrl: string;
    quantity: number;
    price: number;
}

export interface Cart {
    id?: string;
    sessionId: string;
    items: CartItem[];
    createdAt?: Date | null;
    lastUpdated?: Date | null;
    expiresAt?: Date | null;
}
