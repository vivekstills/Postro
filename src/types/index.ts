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

export interface Invoice {
    id?: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCity?: string;
    customerPostalCode?: string;
    notes?: string;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status?: 'pending' | 'emailed' | 'pending-email';
    createdAt?: Date | null;
    emailedAt?: Date | null;
}

export interface CheckoutDetails {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    notes?: string;
}

export interface CheckoutResult {
    invoice: Invoice;
    emailed: boolean;
    emailPending?: boolean;
    emailPromise?: Promise<'sent' | 'failed'>;
}
