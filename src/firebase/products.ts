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
import { db } from './config';
import type { Product } from '../types';

const productsCollection = collection(db, 'products');

// Fetch all products
export const getAllProducts = async (): Promise<Product[]> => {
    const snapshot = await getDocs(query(productsCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
    })) as Product[];
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const q = query(productsCollection, where('category', '==', category), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
    })) as Product[];
};

// Get products by subcategory
export const getProductsBySubcategory = async (subcategory: string): Promise<Product[]> => {
    const q = query(productsCollection, where('subcategory', '==', subcategory), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
    })) as Product[];
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
    const q = query(productsCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        })) as Product[];
        callback(products);
    });
};

// Add new product (imageUrl is now a direct URL, no upload needed)
export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(productsCollection, {
        ...productData,
        createdAt: Timestamp.now()
    });
    return docRef.id;
};

// Update product
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, updates);
};

// Decrease stock when product is sold
export const decreaseStock = async (productId: string): Promise<void> => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
        stock: increment(-1)
    });
};

// Get single product
export const getProduct = async (productId: string): Promise<Product | null> => {
    const productRef = doc(db, 'products', productId);
    const snapshot = await getDoc(productRef);

    if (!snapshot.exists()) return null;

    return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate()
    } as Product;
};

// Delete product
export const deleteProduct = async (productId: string): Promise<void> => {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
};

