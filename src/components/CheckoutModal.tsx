import React, { useEffect, useMemo, useState } from 'react';
import type { CartItem, CheckoutDetails, CheckoutResult } from '../types';
import { formatCurrency } from '../utils/currency';
import { downloadInvoice, formatInvoiceDate, isInvoiceEmailConfigured, sendInvoiceEmail } from '../utils/invoice';
import { useToast } from './ToastProvider';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    subtotal: number;
    shipping: number;
    onCheckout: (details: CheckoutDetails) => Promise<CheckoutResult | null>;
    onCheckoutComplete?: (result: CheckoutResult) => void;
}

const defaultFormValues: CheckoutDetails = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    cartItems,
    subtotal,
    shipping,
    onCheckout,
    onCheckoutComplete
}) => {
    const { addToast } = useToast();
    const [formValues, setFormValues] = useState<CheckoutDetails>(defaultFormValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sent' | 'failed' | 'sending'>('idle');

    useEffect(() => {
        if (!isOpen) {
            setFormValues(defaultFormValues);
            setIsSubmitting(false);
            setCheckoutResult(null);
            setEmailStatus('idle');
        }
    }, [isOpen]);

    const displayItems = useMemo<CartItem[]>(
        () => checkoutResult?.invoice.items ?? cartItems,
        [checkoutResult, cartItems]
    );

    const summarySubtotal = checkoutResult?.invoice.subtotal ?? subtotal;
    const summaryShipping = checkoutResult?.invoice.shipping ?? shipping;
    const summaryTotal = checkoutResult?.invoice.total ?? (subtotal + shipping);

    const handleChange = (field: keyof CheckoutDetails, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (cartItems.length === 0) {
            addToast('ADD ITEMS BEFORE CHECKING OUT');
            return;
        }
        setIsSubmitting(true);
        const result = await onCheckout(formValues);
        setIsSubmitting(false);

        if (result) {
            setCheckoutResult(result);
            setEmailStatus(result.emailed ? 'sent' : 'failed');
            onCheckoutComplete?.(result);
        }
    };

    const handleDownload = () => {
        if (!checkoutResult?.invoice) return;
        downloadInvoice(checkoutResult.invoice);
        addToast('INVOICE DOWNLOADED');
    };

    const handleResend = async () => {
        if (!checkoutResult?.invoice) return;
        try {
            setEmailStatus('sending');
            await sendInvoiceEmail(checkoutResult.invoice);
            setEmailStatus('sent');
            addToast('INVOICE EMAIL SENT');
        } catch (error) {
            console.error('Failed to resend invoice email:', error);
            setEmailStatus('failed');
            addToast('EMAIL FAILED • CHECK SETTINGS');
        }
    };

    if (!isOpen) return null;

    const renderItems = (items: CartItem[]) => (
        <div className="space-y-3 border-b border-dashed border-black/30 pb-4">
            {items.length === 0 && (
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-dark/40">No items</p>
            )}
            {items.map((item) => (
                <div key={`${item.productId}-${item.productName}`} className="flex items-center justify-between text-sm font-bold uppercase tracking-[0.2em] text-dark">
                    <div>
                        <p className="text-xs text-dark/60">{item.productType}</p>
                        <p>{item.productName}</p>
                    </div>
                    <div className="text-right">
                        <p>x{item.quantity}</p>
                        <p className="text-base">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTotals = () => (
        <div className="space-y-2 text-sm font-bold uppercase tracking-[0.3em] text-dark">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(summarySubtotal)}</span>
            </div>
            {summaryShipping > 0 && (
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(summaryShipping)}</span>
                </div>
            )}
            <div className="flex justify-between text-lg">
                <span>Total</span>
                <span>{formatCurrency(summaryTotal)}</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-3xl border-[4px] border-black bg-white p-6 shadow-[12px_12px_0px_0px_#000]">
                <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.5em] text-dark/40">Secure Checkout</p>
                        <h2 className="font-[Unbounded] text-3xl font-black uppercase">Complete Your Order</h2>
                    </div>
                    <button onClick={onClose} className="border-[3px] border-black px-3 py-2 font-bold uppercase tracking-[0.2em]">
                        Close
                    </button>
                </div>

                {!checkoutResult && (
                    <form onSubmit={handleSubmit} className="mt-6 grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            {renderItems(displayItems)}
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-[0.4em] text-dark/60">Full Name</label>
                            <input
                                required
                                value={formValues.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                placeholder="POSTRO FAN"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-[0.4em] text-dark/60">Email</label>
                            <input
                                type="email"
                                required
                                value={formValues.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-[0.4em] text-dark/60">Phone</label>
                            <input
                                value={formValues.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Optional contact"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-[0.4em] text-dark/60">Address</label>
                            <input
                                value={formValues.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Street / Landmark"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-[0.4em] text-dark/60">City</label>
                            <input
                                value={formValues.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                placeholder="Mumbai"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-[0.4em] text-dark/60">Postal Code</label>
                            <input
                                value={formValues.postalCode}
                                onChange={(e) => handleChange('postalCode', e.target.value)}
                                placeholder="400001"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-[0.4em] text-dark/60">Notes</label>
                            <textarea
                                rows={3}
                                value={formValues.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Delivery notes or requests"
                            />
                        </div>

                        <div className="md:col-span-2">
                            {renderTotals()}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-6 w-full border-[3px] border-black bg-[#FF0099] py-4 text-lg font-black uppercase tracking-[0.3em] text-white shadow-[6px_6px_0px_0px_#000]"
                            >
                                {isSubmitting ? 'Processing…' : 'Confirm & Generate Receipt'}
                            </button>
                        </div>
                    </form>
                )}

                {checkoutResult && (
                    <div className="mt-6 space-y-6">
                        <div className="border-[3px] border-black bg-[#F6F6E9] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.5em] text-dark/50">Receipt</p>
                            <h3 className="font-[Unbounded] text-2xl font-black uppercase">Order {checkoutResult.invoice.orderNumber}</h3>
                            <p className="text-xs font-bold uppercase tracking-[0.4em] text-dark/50">{formatInvoiceDate(checkoutResult.invoice.createdAt)}</p>
                        </div>

                        <div>
                            {renderItems(displayItems)}
                            <div className="mt-4">
                                {renderTotals()}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <button onClick={handleDownload} className="border-[3px] border-black bg-white py-3 font-black uppercase tracking-[0.3em]">Download</button>
                            {isInvoiceEmailConfigured() && (
                                <button
                                    onClick={handleResend}
                                    className="border-[3px] border-black bg-black py-3 font-black uppercase tracking-[0.3em] text-white"
                                >
                                    {emailStatus === 'sending' ? 'Sending…' : 'Resend Email'}
                                </button>
                            )}
                            <button onClick={onClose} className="border-[3px] border-black bg-[#CCFF00] py-3 font-black uppercase tracking-[0.3em]">
                                Close
                            </button>
                        </div>

                        <div className="text-xs font-bold uppercase tracking-[0.3em] text-dark/60">
                            Email Status: {emailStatus === 'idle' ? 'Pending' : emailStatus}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
