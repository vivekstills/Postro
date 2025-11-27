import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/currency';
import CheckoutModal from './CheckoutModal';

const CartDrawer = () => {
    const {
        isCartOpen,
        toggleCart,
        setIsCartOpen,
        cartItems,
        updateQuantity,
        removeFromCart,
        totalPrice,
        timeRemaining,
        cartItemCount,
        shippingFee,
        completeCheckout
    } = useCart();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
        try {
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveItem = async (productId: string) => {
        try {
            await removeFromCart(productId);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleCheckoutComplete = () => {
        setIsCartOpen(false);
    };

    return (
        <>
            {/* OVERLAY (Click to close & Sync) */}
            <div
                className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleCart}
            />

            {/* DRAWER PANEL */}
            <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md md:max-w-lg bg-[#F4F4F0] border-l-[4px] border-black z-50 transform transition-transform duration-300 ease-out shadow-[-10px_0px_0px_0px_rgba(0,0,0,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 border-b-[3px] border-black bg-[#CCFF00]">
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <h2 className="font-[Unbounded] text-2xl font-black uppercase">Your Cart ({cartItemCount})</h2>
                        {cartItems.length > 0 && (
                            <p className="text-xs font-bold uppercase tracking-wider mt-1">
                                Expires in: <span className="text-[#FF0099]">{timeRemaining}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={toggleCart} className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* CART ITEMS LIST */}
                <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-220px)]">
                    {cartItems.length === 0 ? (
                        <div className="text-center mt-10 opacity-50 font-[Space_Grotesk]">YOUR CART IS EMPTY</div>
                    ) : (
                        cartItems.map((item) => {
                            const lineTotal = item.price * item.quantity;
                            return (
                                <div key={item.productId} className="relative flex flex-col gap-3 sm:flex-row sm:gap-4 bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000]">

                                {/* IMAGE */}
                                <div className="w-full h-48 sm:h-24 sm:w-20 border-2 border-black flex-shrink-0">
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                </div>

                                {/* DETAILS */}
                                <div className="flex-1 flex flex-col justify-between gap-2">
                                    <div className="space-y-1">
                                        <h3 className="font-[Unbounded] font-bold text-sm uppercase leading-tight">{item.productName}</h3>
                                        <span className="bg-black text-white text-[10px] px-1 uppercase font-bold inline-block w-max">{item.productType}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-[0.3em] text-dark/50 sm:flex-row sm:items-center sm:justify-between">
                                        <span>Each {formatCurrency(item.price)}</span>
                                        <span className="font-[Unbounded] text-base text-dark">Total {formatCurrency(lineTotal)}</span>
                                    </div>

                                    {/* QUANTITY CONTROLS (THE LOGIC FIX) */}
                                    <div className="flex flex-wrap items-center gap-3 pt-1">
                                        <div className="flex border-2 border-black bg-white">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center font-bold hover:bg-[#FF0099] hover:text-white transition-colors"
                                                type="button"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center font-[Space_Grotesk] font-bold border-l-2 border-r-2 border-black">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center font-bold hover:bg-[#CCFF00] hover:text-black transition-colors"
                                                type="button"
                                            >
                                                +
                                            </button>
                                        </div>

                                {/* DELETE BUTTON */}
                                        <button
                                            onClick={() => handleRemoveItem(item.productId)}
                                            className="ml-auto text-gray-400 hover:text-red-600"
                                            type="button"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>

                {/* FOOTER / CHECKOUT */}
                <div className="absolute bottom-0 w-full p-4 sm:p-6 bg-white border-t-[3px] border-black">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 font-[Unbounded] font-bold text-xl">
                        <span>Total</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <button
                        className="w-full bg-[#FF0099] border-[3px] border-black py-3 sm:py-4 font-[Unbounded] font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none hover:bg-black transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                        disabled={cartItems.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        Checkout
                    </button>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartItems={cartItems}
                subtotal={totalPrice}
                shipping={shippingFee}
                onCheckout={completeCheckout}
                onCheckoutComplete={() => handleCheckoutComplete()}
            />
        </>
    );
};

export default CartDrawer;
