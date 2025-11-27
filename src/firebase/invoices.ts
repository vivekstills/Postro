import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    orderBy,
    limit,
    query,
    Timestamp
} from 'firebase/firestore';
import { db, firebaseConfigError } from './config';
import type { Invoice, CartItem } from '../types';

const ensureDb = () => {
    if (!db) {
        throw new Error(firebaseConfigError ?? 'Firebase is not configured. Please set the required environment variables.');
    }
    return db;
};

const getInvoicesCollection = () => collection(ensureDb(), 'invoices');

export type InvoiceInput = Omit<Invoice, 'id' | 'createdAt' | 'emailedAt'> & { emailedAt?: Date | null };

const mapInvoiceItems = (items: any[]): CartItem[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productType: item.productType,
        imageUrl: item.imageUrl,
        quantity: item.quantity ?? 0,
        price: typeof item.price === 'number' ? item.price : 0
    }));
};

const mapInvoiceData = (data: any, id: string): Invoice => ({
    id,
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    customerAddress: data.customerAddress,
    customerCity: data.customerCity,
    customerPostalCode: data.customerPostalCode,
    notes: data.notes,
    items: mapInvoiceItems(data.items),
    subtotal: data.subtotal ?? 0,
    shipping: data.shipping ?? 0,
    total: data.total ?? 0,
    status: data.status,
    createdAt: data.createdAt?.toDate?.() ?? null,
    emailedAt: data.emailedAt?.toDate?.() ?? null
});

export const createInvoice = async (invoiceData: InvoiceInput): Promise<Invoice> => {
    const docRef = await addDoc(getInvoicesCollection(), {
        ...invoiceData,
        createdAt: Timestamp.now(),
        emailedAt: invoiceData.emailedAt ? Timestamp.fromDate(invoiceData.emailedAt) : null
    });

    return {
        id: docRef.id,
        ...invoiceData,
        createdAt: new Date(),
        emailedAt: invoiceData.emailedAt ?? null
    };
};

export const getRecentInvoices = async (limitCount: number = 20): Promise<Invoice[]> => {
    const snapshot = await getDocs(query(getInvoicesCollection(), orderBy('createdAt', 'desc'), limit(limitCount)));
    return snapshot.docs.map((docSnap) => mapInvoiceData(docSnap.data(), docSnap.id));
};

export const updateInvoice = async (invoiceId: string, updates: Partial<InvoiceInput>): Promise<void> => {
    const invoiceRef = doc(ensureDb(), 'invoices', invoiceId);
    const normalizedUpdates: Record<string, any> = { ...updates };
    if (updates.emailedAt instanceof Date) {
        normalizedUpdates.emailedAt = Timestamp.fromDate(updates.emailedAt);
    }
    await updateDoc(invoiceRef, normalizedUpdates);
};
