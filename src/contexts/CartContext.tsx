// Cart Context - Global cart state management
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Cart, CartItem, Product } from '../types';
import {
    addToCart as addToCartFirebase,
    subscribeToCart,
    updateCartItemQuantity,
    removeFromCart as removeFromCartFirebase,
    updateCartTimestamp,
    checkExpiredCarts
} from '../firebase/cart';
import { useToast } from '../components/ToastProvider';
import { isFirebaseConfigured } from '../firebase/config';

interface CartContextType {
    cart: Cart | null;
    cartItems: CartItem[];
    cartItemCount: number;
    isCartOpen: boolean;
    toggleCart: () => void;
    setIsCartOpen: (open: boolean) => void;
    addToCart: (product: Product) => Promise<void>;
    updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    totalPrice: number;
    timeRemaining: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate or retrieve session ID
const getSessionId = (): string => {
    try {
        if (typeof window === 'undefined' || !window.localStorage) {
            throw new Error('localStorage not available');
        }

        let sessionId = window.localStorage.getItem('postro_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            window.localStorage.setItem('postro_session_id', sessionId);
        }
        return sessionId;
    } catch (error) {
        console.warn('Session storage unavailable, generating in-memory session id.', error);
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// localStorage cache utilities
const CART_CACHE_KEY = 'postro_cart_cache';
const CART_CACHE_TIMESTAMP_KEY = 'postro_cart_cache_timestamp';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedCart = (): Cart | null => {
    try {
        const cached = localStorage.getItem(CART_CACHE_KEY);
        const timestamp = localStorage.getItem(CART_CACHE_TIMESTAMP_KEY);

        if (!cached || !timestamp) return null;

        const age = Date.now() - parseInt(timestamp);
        if (age > CACHE_TTL) {
            // Cache expired
            localStorage.removeItem(CART_CACHE_KEY);
            localStorage.removeItem(CART_CACHE_TIMESTAMP_KEY);
            return null;
        }

        const parsedCart = JSON.parse(cached, (key, value) => {
            // Revive Date objects
            if (key === 'createdAt' || key === 'lastUpdated' || key === 'expiresAt') {
                return value ? new Date(value) : undefined;
            }
            return value;
        }) as Cart;
        return normalizeCart(parsedCart);
    } catch (error) {
        console.error('Error reading cart cache:', error);
        return null;
    }
};

const setCachedCart = (cart: Cart | null): void => {
    try {
        const normalizedCart = normalizeCart(cart);
        if (normalizedCart) {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(normalizedCart));
            localStorage.setItem(CART_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } else {
            localStorage.removeItem(CART_CACHE_KEY);
            localStorage.removeItem(CART_CACHE_TIMESTAMP_KEY);
        }
    } catch (error) {
        console.error('Error writing cart cache:', error);
    }
};

type StoredCartItem = Omit<CartItem, 'price'> & { price?: number };

const normalizeCartItem = (item: StoredCartItem): CartItem => ({
    ...item,
    price: typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 ? item.price : 0
});

const normalizeCart = (cart: Cart | null): Cart | null => {
    if (!cart) return null;
    return {
        ...cart,
        items: Array.isArray(cart.items)
            ? (cart.items as StoredCartItem[]).map(normalizeCartItem)
            : []
    };
};

// Format time remaining (e.g., "45:32")
const formatTimeRemaining = (expiresAt?: Date | null): string => {
    if (!expiresAt) return 'EXPIRED';
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'EXPIRED';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<Cart | null>(() => {
        // Initialize from cache if available
        return getCachedCart();
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('60:00');
    const { addToast } = useToast();
    const sessionId = getSessionId();

    // Subscribe to cart changes with caching
    useEffect(() => {
        if (!isFirebaseConfigured) {
            return () => { };
        }

        const unsubscribe = subscribeToCart(sessionId, (updatedCart) => {
            const sanitizedCart = normalizeCart(updatedCart);
            setCart(sanitizedCart);
            setCachedCart(sanitizedCart); // Update cache on every change
        });

        return () => unsubscribe();
    }, [sessionId]);

    // Update time remaining every 5 seconds (reduced from 1 second)
    useEffect(() => {
        if (!cart?.expiresAt) return;

        // Set initial value immediately
        setTimeRemaining(formatTimeRemaining(cart.expiresAt));

        const interval = setInterval(() => {
            setTimeRemaining(formatTimeRemaining(cart.expiresAt));
        }, 5000); // Update every 5 seconds instead of 1 second

        return () => clearInterval(interval);
    }, [cart?.expiresAt]);

    // Check for expired carts every 30 minutes (reduced from 5 minutes)
    useEffect(() => {
        if (!isFirebaseConfigured) {
            return () => { };
        }

        // Run once on mount
        checkExpiredCarts().catch(console.error);

        const interval = setInterval(async () => {
            await checkExpiredCarts().catch(console.error);
        }, 30 * 60 * 1000); // 30 minutes - reduces daily checks from 288 to 48

        return () => clearInterval(interval);
    }, []);

    const cartItems = cart?.items ?? [];
    const cartItemCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

    const addToCart = async (product: Product) => {
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED • CART DISABLED');
            return;
        }
        try {
            const productPrice = typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0
                ? product.price
                : 0;
            // Optimistic update: Update local state immediately
            const existingItem = cart?.items.find(item => item.productId === product.id);
            const updatedCart: Cart = cart ? {
                ...cart,
                items: existingItem
                    ? cart.items.map(item =>
                        item.productId === product.id
                            ? {
                                ...item,
                                quantity: item.quantity + 1,
                                price: typeof item.price === 'number' ? item.price : productPrice
                            }
                            : item
                    )
                    : [...cart.items, {
                        productId: product.id,
                        productName: product.name,
                        productType: product.type,
                        imageUrl: product.imageUrl,
                        quantity: 1,
                        price: productPrice
                    }],
                lastUpdated: new Date()
            } : {
                id: sessionId,
                sessionId,
                items: [{
                    productId: product.id,
                    productName: product.name,
                    productType: product.type,
                    imageUrl: product.imageUrl,
                    quantity: 1,
                    price: productPrice
                }],
                createdAt: new Date(),
                lastUpdated: new Date(),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            };

            const sanitizedCart = normalizeCart(updatedCart);
            setCart(sanitizedCart);
            setCachedCart(sanitizedCart);

            // Then sync to Firebase
            await addToCartFirebase(sessionId, product);
            addToast(`${product.name.toUpperCase()} • ADDED TO CART`);
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            if (error.message.includes('out of stock')) {
                addToast('OUT OF STOCK • TRY ANOTHER DROP');
            } else if (error.message.includes('resource-exhausted')) {
                addToast('CART UPDATED LOCALLY • FIREBASE QUOTA EXCEEDED');
            } else {
                addToast('ERROR • Failed to add to cart');
            }
            // Don't throw - keep optimistic update
        }
    };

    const updateQuantity = async (productId: string, newQuantity: number) => {
        console.log(`Updating quantity for ${productId} to ${newQuantity}`);
        if (!cart) return;
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED • CART DISABLED');
            return;
        }

        try {
            // Optimistic update: Update local state immediately
            const updatedCart: Cart = {
                ...cart,
                items: newQuantity <= 0
                    ? cart.items.filter(item => item.productId !== productId)
                    : cart.items.map(item =>
                        item.productId === productId
                            ? { ...item, quantity: newQuantity }
                            : item
                    ),
                lastUpdated: new Date()
            };

            const sanitizedCart = normalizeCart(updatedCart);
            setCart(sanitizedCart);
            setCachedCart(sanitizedCart);

            // Then sync to Firebase
            if (newQuantity <= 0) {
                await removeFromCartFirebase(sessionId, productId);
                addToast('ITEM REMOVED FROM CART');
                return;
            }
            await updateCartItemQuantity(sessionId, productId, newQuantity);
            console.log('Quantity updated successfully');
        } catch (error: any) {
            console.error('Error updating quantity:', error);
            if (error.message.includes('Not enough stock')) {
                addToast('NOT ENOUGH STOCK');
            } else if (error.message.includes('resource-exhausted')) {
                addToast('UPDATED LOCALLY • FIREBASE QUOTA EXCEEDED');
            } else {
                addToast('ERROR • Failed to update quantity');
            }
            // Don't throw - keep optimistic update
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!cart) return;
        if (!isFirebaseConfigured) {
            addToast('FIREBASE NOT CONFIGURED • CART DISABLED');
            return;
        }

        try {
            // Optimistic update: Update local state immediately
            const updatedCart: Cart = {
                ...cart,
                items: cart.items.filter(item => item.productId !== productId),
                lastUpdated: new Date()
            };

            const sanitizedCart = normalizeCart(updatedCart);
            setCart(sanitizedCart);
            setCachedCart(sanitizedCart);

            // Then sync to Firebase
            await removeFromCartFirebase(sessionId, productId);
            addToast('ITEM REMOVED FROM CART');
        } catch (error: any) {
            console.error('Error removing item:', error);
            if (error.message.includes('resource-exhausted')) {
                addToast('REMOVED LOCALLY • FIREBASE QUOTA EXCEEDED');
            } else {
                addToast('ERROR • Failed to remove item');
            }
            // Don't throw - keep optimistic update
        }
    };

    // Toggle cart drawer with sync logic
    const toggleCart = () => {
        if (isCartOpen) {
            // User is CLOSING the cart - trigger sync to admin panel
            console.log('Syncing cart to Admin Panel database...', cart);
            // The timestamp is already being updated via the useEffect below
        }
        setIsCartOpen(!isCartOpen);
    };

    // Update timestamp when cart closes
    useEffect(() => {
        if (!isFirebaseConfigured) {
            return;
        }

        if (!isCartOpen && cart && cart.items.length > 0) {
            updateCartTimestamp(sessionId).catch(console.error);
        }
    }, [isCartOpen, cart, sessionId]);

    const totalPrice = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cartItems]);

    return (
        <CartContext.Provider
            value={{
                cart,
                cartItems,
                cartItemCount,
                isCartOpen,
                toggleCart,
                setIsCartOpen,
                addToCart,
                updateQuantity,
                removeFromCart,
                totalPrice,
                timeRemaining
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
