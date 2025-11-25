// Firebase Cart Services
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    Timestamp,
    increment
} from 'firebase/firestore';
import { db, firebaseConfigError, isFirebaseConfigured } from './config';
import type { Cart, Product } from '../types';
import { decreaseStock, increaseStock, getProduct } from './products';

const ensureDb = () => {
    if (!db) {
        throw new Error(firebaseConfigError ?? 'Firebase is not configured. Please set the required environment variables.');
    }
    return db;
};

const getCartsCollection = () => collection(ensureDb(), 'carts');

// Helper to calculate expiration time (1 hour from now)
const getExpirationTime = (): Date => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now;
};

// Add product to cart (creates cart if doesn't exist, decreases stock immediately)
export const addToCart = async (sessionId: string, product: Product): Promise<void> => {
    const cartRef = doc(getCartsCollection(), sessionId);
    const cartSnap = await getDoc(cartRef);

    // Check if product has stock
    const currentProduct = await getProduct(product.id);
    if (!currentProduct || currentProduct.stock <= 0) {
        throw new Error('Product out of stock');
    }

    if (cartSnap.exists()) {
        // Cart exists - update it
        const cart = cartSnap.data() as Cart;
        const existingItem = cart.items.find(item => item.productId === product.id);

        if (existingItem) {
            // Increment quantity
            existingItem.quantity += 1;
        } else {
            // Add new item
            cart.items.push({
                productId: product.id,
                productName: product.name,
                productType: product.type,
                imageUrl: product.imageUrl,
                quantity: 1
            });
        }

        await updateDoc(cartRef, {
            items: cart.items,
            lastUpdated: Timestamp.now()
        });
    } else {
        // Create new cart
        const now = new Date();
        const expiresAt = getExpirationTime();

        await setDoc(cartRef, {
            sessionId,
            items: [{
                productId: product.id,
                productName: product.name,
                productType: product.type,
                imageUrl: product.imageUrl,
                quantity: 1
            }],
            createdAt: Timestamp.fromDate(now),
            lastUpdated: Timestamp.fromDate(now),
            expiresAt: Timestamp.fromDate(expiresAt)
        });
    }

    // Decrease stock immediately
    await decreaseStock(product.id);
};

// Update cart item quantity (adjusts stock accordingly)
export const updateCartItemQuantity = async (
    sessionId: string,
    productId: string,
    newQuantity: number
): Promise<void> => {
    const cartRef = doc(getCartsCollection(), sessionId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) {
        throw new Error('Cart not found');
    }

    const cart = cartSnap.data() as Cart;
    const item = cart.items.find(i => i.productId === productId);

    if (!item) {
        throw new Error('Item not found in cart');
    }

    const oldQuantity = item.quantity;
    const difference = newQuantity - oldQuantity;

    if (difference > 0) {
        // Increasing quantity - need to check stock and decrease
        const product = await getProduct(productId);
        if (!product || product.stock < difference) {
            throw new Error('Not enough stock available');
        }

        // Atomic decrease
        await decreaseStock(productId, difference);
    } else if (difference < 0) {
        // Decreasing quantity - restore stock
        // Atomic increase
        await increaseStock(productId, Math.abs(difference));
    }

    // Update cart
    if (newQuantity <= 0) {
        // Remove item from cart if quantity is 0 or less
        cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
        item.quantity = newQuantity;
    }

    await updateDoc(cartRef, {
        items: cart.items,
        lastUpdated: Timestamp.now()
    });
};

// Remove item from cart (restores stock)
export const removeFromCart = async (sessionId: string, productId: string): Promise<void> => {
    const cartRef = doc(getCartsCollection(), sessionId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) return;

    const cart = cartSnap.data() as Cart;
    const item = cart.items.find(i => i.productId === productId);

    if (item) {
        // Restore stock
        await increaseStock(productId, item.quantity);

        // Remove from cart
        cart.items = cart.items.filter(i => i.productId !== productId);

        await updateDoc(cartRef, {
            items: cart.items,
            lastUpdated: Timestamp.now()
        });
    }
};

// Get cart for a session
export const getCart = async (sessionId: string): Promise<Cart | null> => {
    const cartRef = doc(getCartsCollection(), sessionId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) return null;

    const data = cartSnap.data();
    return {
        id: cartSnap.id,
        sessionId: data.sessionId,
        items: data.items,
        createdAt: data.createdAt?.toDate(),
        lastUpdated: data.lastUpdated?.toDate(),
        expiresAt: data.expiresAt?.toDate()
    } as Cart;
};

// Subscribe to cart changes for a user
export const subscribeToCart = (sessionId: string, callback: (cart: Cart | null) => void) => {
    if (!isFirebaseConfigured || !db) {
        console.error(firebaseConfigError ?? 'Firebase configuration missing.');
        return () => { };
    }

    const cartRef = doc(getCartsCollection(), sessionId);
    let lastCartSnapshot: string | null = null; // Cache last snapshot to prevent duplicate callbacks

    return onSnapshot(cartRef, (snapshot) => {
        if (!snapshot.exists()) {
            // Only trigger if we previously had data
            if (lastCartSnapshot !== null) {
                lastCartSnapshot = null;
                callback(null);
            }
            return;
        }

        const data = snapshot.data();
        const currentSnapshot = JSON.stringify(data);

        // Only trigger callback if data actually changed
        if (currentSnapshot !== lastCartSnapshot) {
            lastCartSnapshot = currentSnapshot;
            callback({
                id: snapshot.id,
                sessionId: data.sessionId,
                items: data.items,
                createdAt: data.createdAt?.toDate(),
                lastUpdated: data.lastUpdated?.toDate(),
                expiresAt: data.expiresAt?.toDate()
            } as Cart);
        }
    });
};

// Subscribe to all carts (for admin panel)
export const subscribeToAllCarts = (callback: (carts: Cart[]) => void) => {
    if (!isFirebaseConfigured || !db) {
        console.error(firebaseConfigError ?? 'Firebase configuration missing.');
        return () => { };
    }

    const q = query(getCartsCollection());

    return onSnapshot(q, (snapshot) => {
        const now = new Date();
        const carts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                sessionId: data.sessionId,
                items: data.items,
                createdAt: data.createdAt?.toDate(),
                lastUpdated: data.lastUpdated?.toDate(),
                expiresAt: data.expiresAt?.toDate()
            } as Cart;
        })
            .filter(cart => cart.items.length > 0) // Filter out empty carts
            .filter(cart => cart.expiresAt && cart.expiresAt > now); // Filter out expired carts

        callback(carts);
    });
};

// Clear cart and restore all stock
export const clearCart = async (sessionId: string): Promise<void> => {
    const cartRef = doc(getCartsCollection(), sessionId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) return;

    const cart = cartSnap.data() as Cart;

    // Restore stock for all items
    for (const item of cart.items) {
        await increaseStock(item.productId, item.quantity);
    }

    // Delete cart
    await deleteDoc(cartRef);
};

// Check for expired carts and clean them up
export const checkExpiredCarts = async (): Promise<void> => {
    const now = Timestamp.now();
    const q = query(getCartsCollection(), where('expiresAt', '<=', now));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
        await expireCart(docSnap.id);
    }
};

// Expire a specific cart (restore stock and delete)
export const expireCart = async (sessionId: string): Promise<void> => {
    console.log(`Expiring cart: ${sessionId}`);
    await clearCart(sessionId);
};

// Update cart timestamp (called when cart is modified)
export const updateCartTimestamp = async (sessionId: string): Promise<void> => {
    const cartRef = doc(getCartsCollection(), sessionId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
        await updateDoc(cartRef, {
            lastUpdated: Timestamp.now()
        });
    }
};
