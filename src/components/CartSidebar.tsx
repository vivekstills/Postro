// Cart Sidebar - Slide-out cart with brutalist design
import React from 'react';
import { useCart } from '../contexts/CartContext';
import '../index.css';

const CartSidebar: React.FC = () => {
    const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, timeRemaining } = useCart();

    const handleClose = () => {
        setIsCartOpen(false);
    };

    if (!isCartOpen) return null;

    return (
        <>
            {/* Dark Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={handleClose}
            />

            {/* Sidebar Content */}
            <div className={`fixed top-0 right-0 h-full w-[320px] sm:w-[380px] bg-[#F4F4F0] border-l-[3px] border-black z-50 transform transition-transform duration-300 ease-out shadow-[-10px_0px_0px_0px_rgba(0,0,0,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header with Close Button */}
                <div className="p-4 flex items-center justify-between border-b-[3px] border-black bg-white">
                    <h2 className="font-[Unbounded] text-2xl font-black uppercase">YOUR STACK</h2>
                    <button onClick={handleClose} className="p-2 border-2 border-black hover:bg-[#FF0099] hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Expiration Timer */}
                {cart && cart.items.length > 0 && (
                    <div className="bg-black text-[#CCFF00] p-3 text-center border-b-[3px] border-black">
                        <p className="font-[Space_Grotesk] text-xs uppercase tracking-widest mb-1">Cart Expires In</p>
                        <p className="font-[Unbounded] text-xl font-bold tracking-tighter">{timeRemaining}</p>
                    </div>
                )}

                {/* Cart Items */}
                <div className="p-4 overflow-y-auto h-[calc(100%-180px)] flex flex-col gap-4">
                    {!cart || cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <span className="text-6xl mb-4">🛒</span>
                            <p className="font-[Unbounded] text-xl uppercase">Empty Stack</p>
                            <p className="font-[Space_Grotesk] text-sm mt-2">Go find some heat for your walls.</p>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <div key={item.productId} className="flex gap-3 p-3 border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_#000]">
                                {/* Image */}
                                <div className="w-20 h-20 border-2 border-black shrink-0 bg-gray-200">
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                </div>

                                {/* Details */}
                                <div className="flex flex-col justify-between flex-grow">
                                    <div>
                                        <h3 className="font-[Unbounded] text-sm font-bold leading-tight uppercase line-clamp-2">{item.productName}</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-1 py-0.5 mt-1 inline-block">{item.productType}</span>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border-[3px] border-black bg-white">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white transition-colors font-black text-xl active:bg-[#FF0099]"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 h-10 flex items-center justify-center font-[Unbounded] font-bold text-lg border-l-[3px] border-r-[3px] border-black">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-[#CCFF00] transition-colors font-black text-xl active:bg-black active:text-white"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="p-2 text-xs font-bold uppercase tracking-wider border-[3px] border-transparent hover:border-black hover:bg-red-500 hover:text-white transition-all"
                                            title="Remove Item"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-[#F4F4F0] border-t-[3px] border-black">
                    <div className="flex justify-between items-end mb-4">
                        <span className="font-[Space_Grotesk] font-bold uppercase text-sm">Total Items</span>
                        <span className="font-[Unbounded] text-2xl font-black">{cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0}</span>
                    </div>
                    <button
                        className="group w-full py-5 bg-[#FF0099] text-white font-[Unbounded] font-black text-2xl uppercase border-[3px] border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] hover:bg-black hover:text-[#CCFF00] transition-all active:translate-x-[6px] active:translate-y-[6px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-[6px_6px_0px_0px_#000]"
                        disabled={!cart || cart.items.length === 0}
                    >
                        <span className="flex items-center justify-center gap-3">
                            CHECKOUT <span className="group-hover:translate-x-2 transition-transform">→</span>
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
