import type { Product } from '../types';

const PRODUCT_CACHE_KEY = 'postro_products_cache_v1';
const PRODUCT_CACHE_TIMESTAMP_KEY = 'postro_products_cache_timestamp_v1';
const PRODUCT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CachedProduct extends Omit<Product, 'createdAt'> {
    createdAt?: string | null;
}

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const readProductCache = (): Product[] | null => {
    if (!isBrowser) return null;

    try {
        const cache = window.localStorage.getItem(PRODUCT_CACHE_KEY);
        const timestamp = window.localStorage.getItem(PRODUCT_CACHE_TIMESTAMP_KEY);
        if (!cache || !timestamp) return null;

        const age = Date.now() - Number(timestamp);
        if (Number.isNaN(age) || age > PRODUCT_CACHE_TTL) {
            clearProductCache();
            return null;
        }

        const parsed: CachedProduct[] = JSON.parse(cache);
        return parsed.map((product) => ({
            ...product,
            createdAt: product.createdAt ? new Date(product.createdAt) : undefined
        }));
    } catch (error) {
        console.error('Failed to read product cache:', error);
        return null;
    }
};

export const writeProductCache = (products: Product[]): void => {
    if (!isBrowser) return;

    try {
        const serialized: CachedProduct[] = products.map((product) => ({
            ...product,
            createdAt: product.createdAt ? product.createdAt.toISOString() : null
        }));

        window.localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(serialized));
        window.localStorage.setItem(PRODUCT_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.error('Failed to write product cache:', error);
    }
};

export const clearProductCache = (): void => {
    if (!isBrowser) return;

    window.localStorage.removeItem(PRODUCT_CACHE_KEY);
    window.localStorage.removeItem(PRODUCT_CACHE_TIMESTAMP_KEY);
};
