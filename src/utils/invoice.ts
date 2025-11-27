import type { CartItem, Invoice } from '../types';
import { formatCurrency } from './currency';

export const DEFAULT_SHIPPING_FEE = Number(import.meta.env.VITE_CHECKOUT_SHIPPING_FEE ?? 0);

const emailApiUrl = import.meta.env.VITE_EMAILJS_API_URL ?? 'https://api.emailjs.com/api/v1.0/email/send';
const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '';
const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '';
const emailAccessToken = import.meta.env.VITE_EMAILJS_ACCESS_TOKEN ?? '';

export const isInvoiceEmailConfigured = (): boolean => (
    Boolean(emailServiceId && emailTemplateId && emailPublicKey)
);

export const generateInvoiceNumber = (): string => {
    const randomPart = Math.floor(Math.random() * 9000 + 1000);
    return `POSTRO-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
};

export const calculateTotals = (items: CartItem[], shipping: number = DEFAULT_SHIPPING_FEE) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const normalizedShipping = Number.isFinite(shipping) ? shipping : 0;
    return {
        subtotal,
        shipping: normalizedShipping,
        total: subtotal + normalizedShipping
    };
};

const buildInvoiceLines = (invoice: Invoice): string[] => {
    const addressLine = [invoice.customerAddress, invoice.customerCity, invoice.customerPostalCode]
        .filter(Boolean)
        .join(', ');

    const lines = [
        'POSTRO • ORDER RECEIPT',
        `Order: ${invoice.orderNumber}`,
        `Date: ${formatInvoiceDate(invoice.createdAt)}`,
        `Name: ${invoice.customerName}`,
        `Email: ${invoice.customerEmail}`
    ];

    if (addressLine) {
        lines.push(`Ship To: ${addressLine}`);
    }

    lines.push('\nItems:');
    invoice.items.forEach((item) => {
        lines.push(`- ${item.quantity} x ${item.productName} @ ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`);
    });

    lines.push('\nTotals:');
    lines.push(`Subtotal: ${formatCurrency(invoice.subtotal)}`);
    if (invoice.shipping > 0) {
        lines.push(`Shipping: ${formatCurrency(invoice.shipping)}`);
    }
    lines.push(`Total: ${formatCurrency(invoice.total)}`);

    if (invoice.notes) {
        lines.push('\nNotes:');
        lines.push(invoice.notes);
    }

    return lines;
};

export const downloadInvoice = (invoice: Invoice) => {
    const content = buildInvoiceLines(invoice).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const buildEmailTemplate = (invoice: Invoice) => {
    const itemsTable = invoice.items
        .map((item) => `${item.quantity} x ${item.productName} — ${formatCurrency(item.price * item.quantity)}`)
        .join('\n');

    const messageLines = [
        `Hi ${invoice.customerName},`,
        '',
        `Thanks for shopping at Postro. Here is your receipt for order ${invoice.orderNumber}.`,
        '',
        itemsTable,
        '',
        `Subtotal: ${formatCurrency(invoice.subtotal)}`
    ];

    if (invoice.shipping > 0) {
        messageLines.push(`Shipping: ${formatCurrency(invoice.shipping)}`);
    }

    messageLines.push(`Total: ${formatCurrency(invoice.total)}`);
    messageLines.push('');
    messageLines.push('Stay bold,');
    messageLines.push('Team Postro');

    return {
        subject: `Your Postro Order ${invoice.orderNumber}`,
        message: messageLines.join('\n'),
        rawItems: itemsTable
    };
};

export const sendInvoiceEmail = async (invoice: Invoice): Promise<void> => {
    if (!isInvoiceEmailConfigured()) {
        throw new Error('EMAIL_SERVICE_NOT_CONFIGURED');
    }

    if (!invoice.customerEmail) {
        throw new Error('MISSING_CUSTOMER_EMAIL');
    }

    const template = buildEmailTemplate(invoice);

    const response = await fetch(emailApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            service_id: emailServiceId,
            template_id: emailTemplateId,
            user_id: emailPublicKey,
            accessToken: emailAccessToken || undefined,
            template_params: {
                to_email: invoice.customerEmail,
                to_name: invoice.customerName,
                order_number: invoice.orderNumber,
                subtotal: formatCurrency(invoice.subtotal),
                shipping: invoice.shipping > 0 ? formatCurrency(invoice.shipping) : formatCurrency(0),
                total: formatCurrency(invoice.total),
                items: template.rawItems,
                message: template.message
            }
        })
    });

    if (!response.ok) {
        const errorMessage = await response.text().catch(() => 'Unknown error');
        throw new Error(`FAILED_TO_SEND_INVOICE_EMAIL: ${errorMessage}`);
    }
};

export const formatInvoiceDate = (date?: Date | null): string => {
    if (!date) return new Date().toLocaleString();
    return new Date(date).toLocaleString();
};
