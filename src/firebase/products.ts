// Firebase Product Services
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    Timestamp,
    increment
} from 'firebase/firestore';
import { db, firebaseConfigError, isFirebaseConfigured } from './config';
import type { Product } from '../types';

const ensureDb = () => {
    if (!db) {
        throw new Error(firebaseConfigError ?? 'Firebase is not configured. Please set the required environment variables.');
    }
    return db;
};

const getProductsCollection = () => collection(ensureDb(), 'products');

const mapProductData = (data: any, id: string): Product => ({
    id,
    ...data,
    price: typeof data.price === 'number' ? data.price : 0,
    createdAt: data.createdAt?.toDate?.()
});

// Fetch all products
export const getAllProducts = async (): Promise<Product[]> => {
    const snapshot = await getDocs(query(getProductsCollection(), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => mapProductData(doc.data(), doc.id));
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const q = query(getProductsCollection(), where('category', '==', category), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapProductData(doc.data(), doc.id));
};

// Get products by subcategory
export const getProductsBySubcategory = async (subcategory: string): Promise<Product[]> => {
    const q = query(getProductsCollection(), where('subcategory', '==', subcategory), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapProductData(doc.data(), doc.id));
};

// Search products by name or tags
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
    const allProducts = await getAllProducts();
    const lowerSearch = searchTerm.toLowerCase();

    return allProducts.filter(product =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
    );
};

// Real-time listener for all products
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    if (!isFirebaseConfigured || !db) {
        console.error(firebaseConfigError ?? 'Firebase configuration missing. Cannot subscribe to products.');
        return () => { };
    }
    const q = query(getProductsCollection(), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => mapProductData(doc.data(), doc.id));
        callback(products);
    });
};

// Add new product (imageUrl is now a direct URL, no upload needed)
export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(getProductsCollection(), {
        ...productData,
        createdAt: Timestamp.now()
    });
    return docRef.id;
};

// Update product
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
    const productRef = doc(ensureDb(), 'products', productId);
    await updateDoc(productRef, updates);
};

// Decrease stock when product is sold
export const decreaseStock = async (productId: string, amount: number = 1): Promise<void> => {
    const productRef = doc(ensureDb(), 'products', productId);
    await updateDoc(productRef, {
        stock: increment(-amount)
    });
};

// Increase stock when admin adds inventory
export const increaseStock = async (productId: string, amount: number = 1): Promise<void> => {
    const productRef = doc(ensureDb(), 'products', productId);
    await updateDoc(productRef, {
        stock: increment(amount)
    });
};


// Get single product
export const getProduct = async (productId: string): Promise<Product | null> => {
    const productRef = doc(ensureDb(), 'products', productId);
    const snapshot = await getDoc(productRef);

    if (!snapshot.exists()) return null;

    return mapProductData(snapshot.data(), snapshot.id);
};

// Delete product
export const deleteProduct = async (productId: string): Promise<void> => {
    const productRef = doc(ensureDb(), 'products', productId);
    await deleteDoc(productRef);
};

