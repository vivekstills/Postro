// Cart Context - Global cart state management
import { createContext, useContext, useState, useEffect } from 'react';
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
    let sessionId = localStorage.getItem('postro_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('postro_session_id', sessionId);
    }
    return sessionId;
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

        return JSON.parse(cached, (key, value) => {
            // Revive Date objects
            if (key === 'createdAt' || key === 'lastUpdated' || key === 'expiresAt') {
                return value ? new Date(value) : undefined;
            }
            return value;
        });
    } catch (error) {
        console.error('Error reading cart cache:', error);
        return null;
    }
};

const setCachedCart = (cart: Cart | null): void => {
    try {
        if (cart) {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cart));
            localStorage.setItem(CART_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } else {
            localStorage.removeItem(CART_CACHE_KEY);
            localStorage.removeItem(CART_CACHE_TIMESTAMP_KEY);
        }
    } catch (error) {
        console.error('Error writing cart cache:', error);
    }
};

// Format time remaining (e.g., "45:32")
const formatTimeRemaining = (expiresAt: Date): string => {
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
        const unsubscribe = subscribeToCart(sessionId, (updatedCart) => {
            setCart(updatedCart);
            setCachedCart(updatedCart); // Update cache on every change
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
        // Run once on mount
        checkExpiredCarts();

        const interval = setInterval(async () => {
            await checkExpiredCarts();
        }, 30 * 60 * 1000); // 30 minutes - reduces daily checks from 288 to 48

        return () => clearInterval(interval);
    }, []);

    // Calculate cart item count
    const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const addToCart = async (product: Product) => {
        try {
            // Optimistic update: Update local state immediately
            const existingItem = cart?.items.find(item => item.productId === product.id);
            const updatedCart: Cart = cart ? {
                ...cart,
                items: existingItem
                    ? cart.items.map(item =>
                        item.productId === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                    : [...cart.items, {
                        productId: product.id,
                        productName: product.name,
                        productType: product.type,
                        imageUrl: product.imageUrl,
                        quantity: 1
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
                    quantity: 1
                }],
                createdAt: new Date(),
                lastUpdated: new Date(),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            };

            setCart(updatedCart);
            setCachedCart(updatedCart);

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

            setCart(updatedCart);
            setCachedCart(updatedCart);

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

        try {
            // Optimistic update: Update local state immediately
            const updatedCart: Cart = {
                ...cart,
                items: cart.items.filter(item => item.productId !== productId),
                lastUpdated: new Date()
            };

            setCart(updatedCart);
            setCachedCart(updatedCart);

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
        if (!isCartOpen && cart && cart.items.length > 0) {
            updateCartTimestamp(sessionId).catch(console.error);
        }
    }, [isCartOpen, cart, sessionId]);

    // Calculate cart items array and total price
    const cartItems = cart?.items || [];
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item.quantity * 0), // Price needs to be fetched from product
        0
    );

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
