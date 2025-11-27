import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/currency';

const CartDrawer = () => {
    const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, totalPrice, timeRemaining, cartItemCount } = useCart();

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

    return (
        <>
            {/* OVERLAY (Click to close & Sync) */}
            <div
                className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleCart}
            />

            {/* DRAWER PANEL */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#F4F4F0] border-l-[4px] border-black z-50 transform transition-transform duration-300 ease-out shadow-[-10px_0px_0px_0px_rgba(0,0,0,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b-[3px] border-black bg-[#CCFF00]">
                    <div className="flex flex-col">
                        <h2 className="font-[Unbounded] text-2xl font-black uppercase">Your Cart ({cartItemCount})</h2>
                        {cartItems.length > 0 && (
                            <p className="text-xs font-bold uppercase tracking-wider mt-1">
                                Expires in: <span className="text-[#FF0099]">{timeRemaining}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={toggleCart} className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* CART ITEMS LIST */}
                <div className="p-6 flex flex-col gap-6 overflow-y-auto h-[calc(100vh-200px)]">
                    {cartItems.length === 0 ? (
                        <div className="text-center mt-10 opacity-50 font-[Space_Grotesk]">YOUR CART IS EMPTY</div>
                    ) : (
                        cartItems.map((item) => {
                            const lineTotal = item.price * item.quantity;
                            return (
                                <div key={item.productId} className="relative flex gap-4 bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000]">

                                {/* IMAGE */}
                                <div className="w-20 h-24 border-2 border-black flex-shrink-0">
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                </div>

                                {/* DETAILS */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-[Unbounded] font-bold text-sm uppercase leading-tight">{item.productName}</h3>
                                        <span className="bg-black text-white text-[10px] px-1 uppercase font-bold">{item.productType}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.3em] text-dark/50">
                                        <span>Each {formatCurrency(item.price)}</span>
                                        <span className="font-[Unbounded] text-base text-dark">Total {formatCurrency(lineTotal)}</span>
                                    </div>

                                    {/* QUANTITY CONTROLS (THE LOGIC FIX) */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex border-2 border-black bg-white">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center font-bold hover:bg-[#FF0099] hover:text-white transition-colors"
                                                type="button"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 h-8 flex items-center justify-center font-[Space_Grotesk] font-bold border-l-2 border-r-2 border-black">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center font-bold hover:bg-[#CCFF00] hover:text-black transition-colors"
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
                <div className="absolute bottom-0 w-full p-6 bg-white border-t-[3px] border-black">
                    <div className="flex justify-between mb-4 font-[Unbounded] font-bold text-xl">
                        <span>TOTAL</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <button className="w-full bg-[#FF0099] border-[3px] border-black py-3 font-[Unbounded] font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none hover:bg-black transition-all">
                        Checkout
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
