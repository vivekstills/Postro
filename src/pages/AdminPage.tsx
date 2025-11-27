// Admin Page - Product Upload & Sales Analytics
// URL-BASED IMAGES - NO FIREBASE STORAGE NEEDED!
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { addProduct, getAllProducts, deleteProduct, increaseStock, updateProduct } from '../firebase/products';
import { getAllSalesLogs, getTopSellingProducts, clearAllSalesLogs } from '../firebase/salesLog';
import { getRecentInvoices } from '../firebase/invoices';
import { subscribeToAllCarts } from '../firebase/cart';
import type { Product, SaleLog, Cart, Invoice } from '../types';
import { format } from 'date-fns';
import { useToast } from '../components/ToastProvider';
import { formatCurrency } from '../utils/currency';
import { downloadInvoice } from '../utils/invoice';
import '../index.css';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'logbook' | 'top-selling' | 'analytics' | 'orders'>('upload');

    const ADMIN_PASSWORD = 'postro2025';

    // Upload form state
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState<'poster' | 'sticker'>('poster');
    const [category, setCategory] = useState('Anime Posters');
    const [subcategory, setSubcategory] = useState('');
    const [tags, setTags] = useState('');
    const [stock, setStock] = useState(10);
    const [price, setPrice] = useState('799');
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Sales data
    const [salesLogs, setSalesLogs] = useState<SaleLog[]>([]);
    const [topProducts, setTopProducts] = useState<{ productName: string; count: number }[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [liveCarts, setLiveCarts] = useState<Cart[]>([]);
    const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [productTypeFilter, setProductTypeFilter] = useState<'poster' | 'sticker'>('poster');
    const [addStockProductId, setAddStockProductId] = useState<string | null>(null);
    const [addStockAmount, setAddStockAmount] = useState('1');
    const [editPriceProductId, setEditPriceProductId] = useState<string | null>(null);
    const [editPriceValue, setEditPriceValue] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadSalesData();
            loadProducts();
            loadInvoices();

            const unsubscribeCarts = subscribeToAllCarts((carts) => {
                setLiveCarts(carts);
            });

            return () => {
                unsubscribeCarts();
            };
        }
    }, [isAuthenticated]);

    const loadSalesData = async () => {
        const logs = await getAllSalesLogs();
        const top = await getTopSellingProducts();
        setSalesLogs(logs);
        setTopProducts(top);
    };

    const loadProducts = async () => {
        const products = await getAllProducts();
        setAllProducts(products);
    };

    const loadInvoices = async () => {
        const invoices = await getRecentInvoices(25);
        setRecentInvoices(invoices);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== ADMIN_PASSWORD) {
            setAuthError('Incorrect password');
            addToast('INCORRECT PASSWORD');
            return;
        }

        setIsAuthenticated(true);
        setPassword('');
        setAuthError(null);
        addToast('ADMIN MODE ENABLED');
    };
    const handleLogout = () => {
        setIsAuthenticated(false);
        addToast('Logged out safely');
    };

    const handleUploadProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageUrl.trim()) {
            addToast('IMAGE URL REQUIRED');
            return;
        }

        if (imageError) {
            addToast('IMAGE PREVIEW FAILED • Check the URL');
            return;
        }

        const parsedPrice = Number(price);
        if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
            addToast('INVALID PRICE');
            return;
        }

        setIsUploading(true);

        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

            await addProduct({
                name: productName,
                type: productType,
                category,
                subcategory: subcategory || undefined,
                tags: tagArray,
                imageUrl,
                stock,
                price: parsedPrice
            });

            addToast(`${productName.toUpperCase()} • ADDED TO STORE`);

            setProductName('');
            setSubcategory('');
            setTags('');
            setStock(10);
            setPrice('799');
            setImageUrl('');
            setImageError(false);

            loadProducts();
        } catch (error) {
            console.error('Error uploading product:', error);
            addToast('ERROR • Failed to upload product');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProduct = async (productId: string, productName: string) => {
        const confirmed = window.confirm(
            `⚠️ DELETE PRODUCT?\n\nAre you sure you want to delete "${productName}"?\n\nThis action CANNOT be undone!`
        );

        if (!confirmed) return;

        try {
            await deleteProduct(productId);
            addToast(`${productName.toUpperCase()} • REMOVED`);
            loadProducts(); // Refresh the product list
        } catch (error: any) {
            console.error('Error deleting product:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            addToast('ERROR • Failed to delete product');
        }
    };

    const handleClearSalesLogs = async () => {
        const confirmed = window.confirm(
            `⚠️ CLEAR ALL SALES LOGS?\n\nThis will delete ALL sales records and reset the top selling products.\n\nThis action CANNOT be undone!\n\nAre you sure?`
        );

        if (!confirmed) return;

        try {
            await clearAllSalesLogs();
            addToast('SALES LOG • CLEARED');
            loadSalesData(); // Refresh the sales data
        } catch (error: any) {
            console.error('Error clearing sales logs:', error);
            addToast('ERROR • Failed to clear sales logs');
        }
    };

    const handleAddStock = (productId: string) => {
        // Toggle the inline add stock card
        if (addStockProductId === productId) {
            setAddStockProductId(null);
            setAddStockAmount('1');
        } else {
            setAddStockProductId(productId);
            setAddStockAmount('1');
        }
        setEditPriceProductId(null);
    };

    const confirmAddStock = async (productId: string, productName: string) => {
        if (!addStockAmount || isNaN(Number(addStockAmount)) || Number(addStockAmount) < 1) {
            addToast('INVALID AMOUNT');
            return;
        }

        try {
            await increaseStock(productId, Number(addStockAmount));
            addToast(`+${addStockAmount} STOCK • ${productName.toUpperCase()}`);
            loadProducts();
            setAddStockProductId(null);
            setAddStockAmount('1');
        } catch (error) {
            console.error('Error adding stock:', error);
            addToast('ERROR • Failed to add stock');
        }
    };

    const handleEditPrice = (productId: string, currentPrice: number) => {
        if (editPriceProductId === productId) {
            setEditPriceProductId(null);
            setEditPriceValue('');
        } else {
            setEditPriceProductId(productId);
            setEditPriceValue(currentPrice.toString());
        }
        setAddStockProductId(null);
    };

    const confirmPriceUpdate = async (productId: string, productName: string) => {
        const parsed = Number(editPriceValue);
        if (!editPriceValue || Number.isNaN(parsed) || parsed <= 0) {
            addToast('INVALID PRICE');
            return;
        }

        try {
            await updateProduct(productId, { price: parsed });
            addToast(`${productName.toUpperCase()} • PRICE UPDATED`);
            setEditPriceProductId(null);
            setEditPriceValue('');
            loadProducts();
        } catch (error) {
            console.error('Error updating price:', error);
            addToast('ERROR • Failed to update price');
        }
    };

    const handleDownloadInvoice = (invoice: Invoice) => {
        downloadInvoice(invoice);
        addToast(`INVOICE • ${invoice.orderNumber}`);
    };

    // Filter products for analytics tab
    const filteredProducts = allProducts.filter(product => {
        if (product.type !== productTypeFilter) return false;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(lowerSearch) ||
                product.tags.some(tag => tag.toLowerCase().includes(lowerSearch)) ||
                product.category.toLowerCase().includes(lowerSearch)
            );
        }

        return true;
    });

    if (!isAuthenticated) {
        return (
            <div className="admin-page">
                <Header />
                <div className="login-container flex min-h-[70vh] items-center justify-center px-6 py-16">
                    <div className="login-box w-full max-w-md border-[3px] border-dark bg-surface p-10 text-center shadow-hard">
                        <p className="text-xs font-bold uppercase tracking-[0.5em] text-dark/40">Secure Console</p>
                        <h2 className="mt-2 font-display text-3xl uppercase tracking-tight text-dark">Admin Login</h2>
                        <form onSubmit={handleLogin}>
                            <input
                                type="password"
                                placeholder="ENTER PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-md w-full border-[3px] border-dark bg-main px-4 py-3 font-semibold uppercase tracking-[0.2em] text-dark"
                                required
                            />
                            {authError && <p className="mt-sm text-sm font-semibold text-red-500">{authError}</p>}
                            <button type="submit" className="primary mt-md w-full">
                                LOGIN
                            </button>
                        </form>
                        <button onClick={() => navigate('/')} className="mt-md w-full">
                            BACK TO HOME
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <Header />
            <div className="admin-container container">
                <div className="admin-header">
                    <h2 className="admin-title">ADMIN PANEL</h2>
                    <button onClick={handleLogout} className="danger">LOGOUT</button>
                </div>

                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>UPLOAD PRODUCT</button>
                    <button className={`tab-btn ${activeTab === 'logbook' ? 'active' : ''}`} onClick={() => setActiveTab('logbook')}>SALES LOGBOOK</button>
                    <button className={`tab-btn ${activeTab === 'top-selling' ? 'active' : ''}`} onClick={() => setActiveTab('top-selling')}>TOP SELLING</button>
                    <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>ANALYTICS</button>
                    <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>ORDERS ({liveCarts.length})</button>
                </div>

                {activeTab === 'upload' && (
                    <div className="tab-content">
                        <form onSubmit={handleUploadProduct} className="upload-form">
                            <div className="form-grid">
                                <div className="form-section full-width">
                                    <label className="form-label">PRODUCT IMAGE URL 🔗</label>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => {
                                            setImageUrl(e.target.value);
                                            setImageError(false);
                                        }}
                                        placeholder="https://i.imgur.com/abc123.png"
                                        required
                                    />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-mid)', marginTop: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                                        💡 <strong>Right-click image on Imgur → "Copy image address"</strong> (NOT "Copy Link"!)
                                    </p>
                                    {imageUrl && (
                                        <div className="image-preview mt-md">
                                            {!imageError ? (
                                                <img
                                                    src={imageUrl}
                                                    alt="Preview"
                                                    onError={() => setImageError(true)}
                                                    onLoad={() => setImageError(false)}
                                                />
                                            ) : (
                                                <div className="image-error">
                                                    <p>⚠️ Image failed to load</p>
                                                    <small>Make sure you copied the IMAGE address, not the page link</small>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="form-section">
                                    <label className="form-label">PRODUCT NAME</label>
                                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Naruto Uzumaki Poster" required />
                                </div>

                                <div className="form-section">
                                    <label className="form-label">TYPE</label>
                                    <select value={productType} onChange={(e) => setProductType(e.target.value as 'poster' | 'sticker')}>
                                        <option value="poster">Poster</option>
                                        <option value="sticker">Sticker</option>
                                    </select>
                                </div>

                                <div className="form-section">
                                    <label className="form-label">CATEGORY</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="Anime Posters">Anime Posters</option>
                                        <option value="Movie Posters">Movie Posters</option>
                                        <option value="Car Posters">Car Posters</option>
                                        <option value="Bike Posters">Bike Posters</option>
                                        <option value="Stickers">Stickers</option>
                                    </select>
                                </div>

                                <div className="form-section">
                                    <label className="form-label">SUBCATEGORY (Optional)</label>
                                    <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="e.g., Naruto, Marvel, JDM" />
                                </div>

                                <div className="form-section full-width">
                                    <label className="form-label">TAGS (comma separated)</label>
                                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., anime, action, ninja, orange" />
                                </div>

                                <div className="form-section">
                                    <label className="form-label">INITIAL STOCK</label>
                                    <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value))} min="1" required />
                                </div>

                                <div className="form-section">
                                    <label className="form-label">PRICE (INR)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="799"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="accent mt-xl"
                                style={{ width: '100%', padding: 'var(--space-lg)' }}
                                disabled={isUploading || imageError}
                            >
                                {isUploading ? 'UPLOADING...' : 'ADD PRODUCT'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'logbook' && (
                    <div className="tab-content">
                        <div className="logbook-stats mb-lg">
                            <span className="tag tag-green">TOTAL SALES: {salesLogs.length}</span>
                        </div>
                        <div className="table-container">
                            <table className="sales-table">
                                <thead>
                                    <tr>
                                        <th>TIME</th>
                                        <th>PRODUCT</th>
                                        <th>CATEGORY</th>
                                        <th>STOCK BEFORE</th>
                                        <th>STOCK AFTER</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{format(log.timestamp, 'MMM dd, HH:mm:ss')}</td>
                                            <td><strong>{log.productName}</strong></td>
                                            <td><span className="tag">{log.category}</span></td>
                                            <td>{log.stockBefore}</td>
                                            <td>{log.stockAfter}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'top-selling' && (
                    <div className="tab-content">
                        <div className="section-header">
                            <h3 className="mb-lg">TOP SELLING PRODUCTS</h3>
                            {topProducts.length > 0 && (
                                <button
                                    className="danger"
                                    onClick={handleClearSalesLogs}
                                    title="Clear all sales logs"
                                >
                                    🗑️ CLEAR ALL SALES
                                </button>
                            )}
                        </div>
                        <div className="top-products">
                            {topProducts.map((item, index) => (
                                <div key={item.productName} className="top-product-item card card-shadow">
                                    <span className="rank tag tag-accent">#{index + 1}</span>
                                    <div className="product-info-analytics">
                                        <h4>{item.productName}</h4>
                                        <span className="sales-count tag tag-green">{item.count} SOLD</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="tab-content">

                        {/* SEARCH BAR SECTION */}
                        <div className="admin-search-section">
                            <div className="search-box">
                                <p className="search-label">SCAN THE INVENTORY</p>
                                <h3 className="search-title">FIND PRODUCTS</h3>
                                <SearchBar onSearch={setSearchTerm} />
                            </div>
                        </div>

                        {/* TOGGLE SWITCHES */}
                        <div className="flex justify-center items-center gap-4 sm:gap-6 mb-8">
                            {/* POSTERS BUTTON */}
                            <button
                                onClick={() => setProductTypeFilter('poster')}
                                className={`
                                relative px-4 sm:px-6 md:px-8 py-2 sm:py-3 font-display font-black uppercase text-base sm:text-lg border-[3px] border-dark transition-all duration-200
                                ${productTypeFilter === 'poster'
                                        ? 'bg-primary text-dark shadow-[6px_6px_0px_0px_#0D0D0D] translate-x-[-2px] translate-y-[-2px]'
                                        : 'bg-surface text-dark/50 hover:text-dark hover:shadow-[4px_4px_0px_0px_#0D0D0D] shadow-[0px_0px_0px_0px_#0D0D0D]'
                                    }
                              `}
                            >
                                POSTERS
                                {/* Active Indicator Dot */}
                                {productTypeFilter === 'poster' && (
                                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF0099] border-2 border-dark rounded-none"></span>
                                )}
                            </button>

                            <span className="font-display text-xl sm:text-2xl font-black text-dark/20">/</span>

                            {/* STICKERS BUTTON */}
                            <button
                                onClick={() => setProductTypeFilter('sticker')}
                                className={`
                                relative px-4 sm:px-6 md:px-8 py-2 sm:py-3 font-display font-black uppercase text-base sm:text-lg border-[3px] border-dark transition-all duration-200
                                ${productTypeFilter === 'sticker'
                                        ? 'bg-primary text-dark shadow-[6px_6px_0px_0px_#0D0D0D] translate-x-[-2px] translate-y-[-2px]'
                                        : 'bg-surface text-dark/50 hover:text-dark hover:shadow-[4px_4px_0px_0px_#0D0D0D] shadow-[0px_0px_0px_0px_#0D0D0D]'
                                    }
                              `}
                            >
                                STICKERS
                                {productTypeFilter === 'sticker' && (
                                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF0099] border-2 border-dark rounded-none"></span>
                                )}
                            </button>
                        </div>

                        {/* RESULT COUNT TAG */}
                        <div className="mb-6">
                            <div className="result-count-tag">
                                SHOWING {filteredProducts.length} {productTypeFilter.toUpperCase()}S
                            </div>
                        </div>

                        <h3 className="mt-2xl mb-lg">CURRENT INVENTORY ({allProducts.length} products)</h3>
                        <div className="inventory-grid">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="inventory-item card card-shadow">
                                    <div className="inventory-image">
                                        <img src={product.imageUrl} alt={product.name} />
                                    </div>
                                    <div className="inventory-details">
                                        <strong>{product.name}</strong>
                                        <div className="inventory-meta">
                                            <span className="tag mt-sm">{product.type}</span>
                                            <span className="tag mt-sm">{product.stock} in stock</span>
                                            <span className="tag mt-sm bg-black text-primary">{formatCurrency(product.price)}</span>
                                        </div>
                                    </div>
                                    <div className="inventory-actions">
                                        <button
                                            className="accent add-btn"
                                            onClick={() => handleAddStock(product.id!)}
                                            title="Add stock"
                                        >
                                            ➕ ADD
                                        </button>

                                        {/* INLINE ADD STOCK CARD */}
                                        {addStockProductId === product.id && (
                                            <div className="add-stock-card">
                                                <label className="add-stock-label">QUANTITY</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={addStockAmount}
                                                    onChange={(e) => setAddStockAmount(e.target.value)}
                                                    className="add-stock-input"
                                                    placeholder="1"
                                                    autoFocus
                                                />
                                                <div className="add-stock-actions">
                                                    <button
                                                        className="accent add-stock-confirm"
                                                        onClick={() => confirmAddStock(product.id!, product.name)}
                                                    >
                                                        ✓ ADD
                                                    </button>
                                                    <button
                                                        className="add-stock-cancel"
                                                        onClick={() => { setAddStockProductId(null); setAddStockAmount('1'); }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            className="danger delete-btn"
                                            onClick={() => handleDeleteProduct(product.id!, product.name)}
                                            title="Delete product"
                                        >
                                            🗑️ DELETE
                                        </button>

                                        <button
                                            className="primary price-btn"
                                            onClick={() => handleEditPrice(product.id!, product.price)}
                                            title="Update price"
                                        >
                                            💰 PRICE
                                        </button>

                                        {editPriceProductId === product.id && (
                                            <div className="edit-price-card">
                                                <label className="add-stock-label">NEW PRICE (INR)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="0.5"
                                                    value={editPriceValue}
                                                    onChange={(e) => setEditPriceValue(e.target.value)}
                                                    className="add-stock-input"
                                                    placeholder="799"
                                                    autoFocus
                                                />
                                                <div className="add-stock-actions">
                                                    <button
                                                        className="accent add-stock-confirm"
                                                        onClick={() => confirmPriceUpdate(product.id!, product.name)}
                                                    >
                                                        ✓ SAVE
                                                    </button>
                                                    <button
                                                        className="add-stock-cancel"
                                                        onClick={() => { setEditPriceProductId(null); setEditPriceValue(''); }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="tab-content">
                        <div className="section-header">
                            <h3 className="mb-lg">LIVE ORDERS ({liveCarts.length})</h3>
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                                Real-time view of active carts
                            </div>
                        </div>

                        {liveCarts.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🛒</div>
                                <h2 className="empty-text">NO ACTIVE ORDERS</h2>
                                <p>Waiting for customers to start shopping...</p>
                            </div>
                        ) : (
                            <div className="orders-grid">
                                {liveCarts.map((cart) => {
                                    // Calculate time remaining
                                    const now = new Date();
                                    const expiresAt = cart.expiresAt;
                                    const diff = expiresAt ? expiresAt.getTime() - now.getTime() : -1;
                                    const minutes = Math.floor(diff / 60000);
                                    const seconds = Math.floor((diff % 60000) / 1000);
                                    const timeString = diff <= 0 ? 'EXPIRED' : `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                    const isExpiringSoon = diff > 0 && diff < 10 * 60 * 1000; // Less than 10 mins
                                    const cartTotal = cart.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

                                    return (
                                        <div key={cart.id} className="order-card card card-shadow">
                                            <div className="order-header">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Session ID</span>
                                                    <span className="font-[Unbounded] font-bold">{cart.sessionId.substring(0, 12)}...</span>
                                                </div>
                                                <div className={`expiration-badge ${isExpiringSoon ? 'urgent' : ''}`}>
                                                    <span className="text-[10px] font-bold uppercase">Expires In</span>
                                                    <span className="font-[Unbounded] font-bold text-lg">{timeString}</span>
                                                </div>
                                            </div>

                                            <div className="order-items">
                                                {cart.items && cart.items.length > 0 ? (
                                                    cart.items.map((item, index) => (
                                                        <div key={`${item.productId}-${index}`} className="order-item">
                                                            <div className="w-12 h-12 border border-black bg-gray-200 shrink-0">
                                                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-grow">
                                                                <p className="font-bold text-sm leading-tight line-clamp-1">{item.productName}</p>
                                                                <span className="text-[10px] uppercase bg-black text-white px-1">{item.productType}</span>
                                                            </div>
                                                            <div className="font-[Unbounded] font-bold text-lg">
                                                                x{item.quantity}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-center text-gray-500 text-xs">No items</div>
                                                )}
                                            </div>

                                            <div className="order-footer">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Items</span>
                                                    <span className="font-[Unbounded] font-bold text-xl">{cart.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                     <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Cart Value</span>
                                                     <span className="font-[Unbounded] font-bold text-xl">{formatCurrency(cartTotal)}</span>
                                                </div>
                                                <div className="mt-2 text-[10px] font-bold uppercase text-gray-400 text-right">
                                                    Last Active: {cart.lastUpdated ? format(cart.lastUpdated, 'HH:mm:ss') : 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="section-header mt-16">
                            <h3 className="mb-lg">RECENT RECEIPTS ({recentInvoices.length})</h3>
                            <button className="primary" onClick={loadInvoices}>
                                REFRESH
                            </button>
                        </div>

                        {recentInvoices.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h2 className="empty-text">NO RECEIPTS YET</h2>
                                <p>Invoices appear here after customers checkout.</p>
                            </div>
                        ) : (
                            <div className="invoices-grid">
                                {recentInvoices.map((invoice) => (
                                    <div key={invoice.id} className="invoice-card card card-shadow">
                                        <div className="invoice-card-header">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Order ID</p>
                                                <h4 className="font-[Unbounded] text-lg">{invoice.orderNumber}</h4>
                                            </div>
                                            <span className={`status-pill ${invoice.status === 'emailed' ? 'sent' : 'pending'}`}>
                                                {invoice.status?.toUpperCase() ?? 'PENDING'}
                                            </span>
                                        </div>
                                        <div className="invoice-card-body">
                                            <p className="font-bold">{invoice.customerName}</p>
                                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{invoice.customerEmail}</p>
                                            <p className="mt-2 text-right font-[Unbounded] text-xl">{formatCurrency(invoice.total)}</p>
                                        </div>
                                        <div className="invoice-card-footer">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Created</p>
                                                <p className="font-mono text-xs">{invoice.createdAt ? format(invoice.createdAt, 'MMM dd, HH:mm') : 'Pending'}</p>
                                            </div>
                                            <div className="invoice-actions">
                                                <button className="accent" onClick={() => handleDownloadInvoice(invoice)}>
                                                    DOWNLOAD
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        .admin-page { min-height: 100vh; background: var(--white); }
        .admin-container { padding: var(--space-2xl) var(--space-lg); }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xl); padding-bottom: var(--space-lg); border-bottom: var(--border-thick) solid var(--black); }
        .admin-title { color: var(--neon-pink); }
        .tabs { display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl); border-bottom: var(--border-thick) solid var(--black); flex-wrap: wrap; }
        .tab-btn { padding: var(--space-md) var(--space-xl); background: transparent; border: none; border-bottom: var(--border-thick) solid transparent; font-family: var(--font-heading); font-size: 1rem; cursor: pointer; transition: all 0.15s ease; }
        .tab-btn:hover { background: var(--primary); color: var(--black); }
        .tab-btn.active { background: var(--secondary); color: var(--bg-main); border-bottom-color: var(--bg-main); }
        .tab-content { background: var(--white); padding: var(--space-xl); border: var(--border-thick) solid var(--black); }
        .upload-form { max-width: 800px; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg); }
        .form-section { display: flex; flex-direction: column; }
        .form-section.full-width { grid-column: 1 / -1; }
        .form-label { font-family: var(--font-heading); font-size: 0.9rem; text-transform: uppercase; margin-bottom: var(--space-sm); color: var(--black); }
        .image-preview { width: 300px; height: 300px; border: var(--border-thick) solid var(--black); overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--gray-light); }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        .image-error { text-align: center; padding: var(--space-lg); color: var(--hot-orange); }
        .image-error p { font-family: var(--font-heading); margin-bottom: var(--space-sm); }
        .table-container { overflow-x: auto; border: var(--border-thick) solid var(--black); }
        .sales-table { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
        .sales-table th { background: var(--black); color: var(--neon-pink); padding: var(--space-md); text-align: left; font-family: var(--font-heading); font-size: 0.9rem; border-right: var(--border-thin) solid var(--gray-mid); }
        .sales-table td { padding: var(--space-md); border-bottom: var(--border-thin) solid var(--gray-light); border-right: var(--border-thin) solid var(--gray-light); }
        .sales-table tbody tr:hover { background: var(--neon-yellow); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); }
        .section-header h3 { margin-bottom: 0; }
        .top-products { display: grid; gap: var(--space-md); }
        .top-product-item { display: flex; align-items: center; gap: var(--space-lg); padding: var(--space-lg); }
        .rank { font-size: 1.5rem; min-width: 50px; text-align: center; }
        .product-info-analytics { flex: 1; display: flex; justify-content: space-between; align-items: center; }
        .sales-count { font-size: 1rem; }
        .inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-lg); }
        .inventory-item { padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); position: relative; }
        .inventory-image { width: 100%; aspect-ratio: 3/4; overflow: hidden; border: var(--border-thick) solid var(--black); background: var(--gray-light); }
        .inventory-image img { width: 100%; height: 100%; object-fit: cover; }
        .inventory-details { display: flex; flex-direction: column; gap: var(--space-sm); }
        .inventory-meta { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
        .inventory-actions { display: flex; flex-direction: column; gap: var(--space-sm); margin-top: auto; }
        .add-btn { width: 100%; padding: var(--space-sm); font-size: 0.9rem; }
        .delete-btn { width: 100%; padding: var(--space-sm); font-size: 0.9rem; }
        .price-btn { width: 100%; padding: var(--space-sm); font-size: 0.9rem; }
        
        /* Inline Add Stock Card */
        .add-stock-card { background: var(--surface); border: 3px solid var(--black); padding: var(--space-md); margin-top: var(--space-sm); box-shadow: 4px 4px 0px 0px var(--black); }
        .add-stock-label { font-family: var(--font-heading); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--gray-mid); display: block; margin-bottom: var(--space-sm); }
        .add-stock-input { width: 100%; border: 3px solid var(--black); padding: var(--space-sm); font-family: var(--font-body); font-size: 1rem; font-weight: bold; margin-bottom: var(--space-md); }
        .add-stock-actions { display: flex; gap: var(--space-sm); }
        .add-stock-confirm { flex: 1; padding: var(--space-sm); font-size: 0.9rem; }
        .add-stock-cancel { padding: var(--space-sm) var(--space-md); background: var(--surface); border: 3px solid var(--black); font-weight: bold; cursor: pointer; transition: all 0.15s ease; }
        .add-stock-cancel:hover { background: var(--gray-light); }
        .edit-price-card { background: var(--surface); border: 3px solid var(--black); padding: var(--space-md); margin-top: var(--space-sm); box-shadow: 4px 4px 0px 0px var(--black); }

        /* Search Section */
        .admin-search-section { background: var(--surface); border: var(--border-thick) solid var(--black); padding: var(--space-xl); margin-bottom: var(--space-xl); box-shadow: var(--shadow-hard); }
        .search-box { max-width: 600px; margin: 0 auto; }
        .search-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: var(--gray-mid); }
        .search-title { font-family: var(--font-display); font-size: 2rem; margin-bottom: var(--space-md); }
        .result-count-tag { display: inline-block; background: var(--primary); border: 2px solid var(--black); padding: var(--space-sm) var(--space-md); font-weight: bold; font-size: 0.75rem; box-shadow: 2px 2px 0px 0px var(--black); text-transform: uppercase; letter-spacing: 0.2em; }
        
        /* Orders Tab */
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-lg); }
        .order-card { padding: 0; display: flex; flex-direction: column; background: var(--surface); border: 3px solid var(--black); }
        .order-header { padding: var(--space-md); border-bottom: 3px solid var(--black); display: flex; justify-content: space-between; align-items: center; background: var(--white); }
        .expiration-badge { display: flex; flex-direction: column; align-items: flex-end; color: var(--black); }
        .expiration-badge.urgent { color: var(--hot-orange); animation: pulse 2s infinite; }
        .order-items { padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-md); max-height: 400px; overflow-y: auto; }
        .order-item { display: flex; gap: var(--space-md); align-items: center; padding-bottom: var(--space-sm); border-bottom: 1px dashed var(--gray-light); }
        .order-item:last-child { border-bottom: none; padding-bottom: 0; }
        .order-footer { padding: var(--space-md); border-top: 3px solid var(--black); background: var(--gray-light); margin-top: auto; }
        .invoices-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-md); margin-top: var(--space-md); }
        .invoice-card { padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); background: var(--surface); border: var(--border-thick) solid var(--black); box-shadow: var(--shadow-tag); }
        .invoice-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-sm); }
        .invoice-card-body { border-top: var(--border-thin) dashed var(--black); border-bottom: var(--border-thin) dashed var(--black); padding: var(--space-sm) 0; display: flex; flex-direction: column; gap: var(--space-xs); }
        .invoice-card-footer { display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.75rem; gap: var(--space-md); }
        .status-pill { padding: var(--space-xs) var(--space-sm); border: var(--border-thin) solid var(--black); font-size: 0.6rem; font-family: var(--font-heading); text-transform: uppercase; letter-spacing: 0.1em; }
        .status-pill.sent { background: var(--primary); color: var(--black); }
        .status-pill.pending { background: var(--accent); color: var(--white); }
        .invoice-actions button { padding: var(--space-xs) var(--space-md); font-size: 0.7rem; }
        
        .empty-state {
            text-align: center;
            padding: var(--space-3xl);
            background: var(--gray-light);
            border: var(--border-chunky) dashed var(--black);
        }
        .empty-icon { font-size: 4rem; margin-bottom: var(--space-lg); }
        .empty-text { font-family: var(--font-display); font-size: 2rem; color: var(--gray-mid); margin-bottom: var(--space-md); }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .admin-header { flex-direction: column; gap: var(--space-md); align-items: flex-start); }
        }
      `}</style>
        </div>
    );
};

export default AdminPage;
