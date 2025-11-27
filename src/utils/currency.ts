const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

export const formatCurrency = (value: number): string => {
    if (!Number.isFinite(value)) {
        return formatter.format(0);
    }
    return formatter.format(value);
};
