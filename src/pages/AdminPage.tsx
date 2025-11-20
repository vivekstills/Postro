// Admin Page - Product Upload & Sales Analytics
// URL-BASED IMAGES - NO FIREBASE STORAGE NEEDED!
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { addProduct, getAllProducts, deleteProduct } from '../firebase/products';
import { getAllSalesLogs, getTopSellingProducts, clearAllSalesLogs } from '../firebase/salesLog';
import type { Product, SaleLog } from '../types';
import { format } from 'date-fns';
import '../index.css';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'upload' | 'logbook' | 'analytics'>('upload');

    // Upload form state
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState<'poster' | 'sticker'>('poster');
    const [category, setCategory] = useState('Anime Posters');
    const [subcategory, setSubcategory] = useState('');
    const [tags, setTags] = useState('');
    const [stock, setStock] = useState(10);
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Sales data
    const [salesLogs, setSalesLogs] = useState<SaleLog[]>([]);
    const [topProducts, setTopProducts] = useState<{ productName: string; count: number }[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    const ADMIN_PASSWORD = 'postro2025';

    useEffect(() => {
        if (isAuthenticated) {
            loadSalesData();
            loadProducts();
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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('❌ INCORRECT PASSWORD');
            setPassword('');
        }
    };

    const handleUploadProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageUrl.trim()) {
            alert('❌ Please enter an image URL');
            return;
        }

        if (imageError) {
            alert('❌ Image preview failed to load. Please check your URL.');
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
                stock
            });

            alert(`✅ SUCCESS!\n\n${productName} has been added to the store!`);

            setProductName('');
            setSubcategory('');
            setTags('');
            setStock(10);
            setImageUrl('');
            setImageError(false);

            loadProducts();
        } catch (error) {
            console.error('Error uploading product:', error);
            alert('❌ ERROR: Failed to upload product. Check console for details.');
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
            alert(`✅ DELETED!\n\n"${productName}" has been removed from the store.`);
            loadProducts(); // Refresh the product list
        } catch (error: any) {
            console.error('Error deleting product:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            alert(`❌ ERROR: Failed to delete product.\n\nError: ${error.message}\n\nCheck console for details.`);
        }
    };

    const handleClearSalesLogs = async () => {
        const confirmed = window.confirm(
            `⚠️ CLEAR ALL SALES LOGS?\n\nThis will delete ALL sales records and reset the top selling products.\n\nThis action CANNOT be undone!\n\nAre you sure?`
        );

        if (!confirmed) return;

        try {
            await clearAllSalesLogs();
            alert(`✅ CLEARED!\n\nAll sales logs have been deleted.`);
            loadSalesData(); // Refresh the sales data
        } catch (error: any) {
            console.error('Error clearing sales logs:', error);
            alert(`❌ ERROR: Failed to clear sales logs.\n\nError: ${error.message}`);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-page">
                <Header />
                <div className="login-container">
                    <div className="login-box card card-shadow">
                        <h2>ADMIN LOGIN</h2>
                        <form onSubmit={handleLogin}>
                            <input
                                type="password"
                                placeholder="ENTER PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-lg"
                            />
                            <button type="submit" className="primary mt-md" style={{ width: '100%' }}>
                                LOGIN
                            </button>
                        </form>
                        <button onClick={() => navigate('/')} className="mt-md" style={{ width: '100%' }}>
                            BACK TO HOME
                        </button>
                    </div>
                </div>
                <style>{`
          .login-container { display: flex; justify-content: center; align-items: center; min-height: 70vh; padding: var(--space-2xl); }
          .login-box { max-width: 400px; width: 100%; padding: var(--space-2xl); text-align: center; }
          .login-box h2 { margin-bottom: var(--space-lg); }
        `}</style>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <Header />
            <div className="admin-container container">
                <div className="admin-header">
                    <h2 className="admin-title">ADMIN PANEL</h2>
                    <button onClick={() => setIsAuthenticated(false)} className="danger">LOGOUT</button>
                </div>

                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>UPLOAD PRODUCT</button>
                    <button className={`tab-btn ${activeTab === 'logbook' ? 'active' : ''}`} onClick={() => setActiveTab('logbook')}>SALES LOGBOOK</button>
                    <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>ANALYTICS</button>
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

                {activeTab === 'analytics' && (
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

                        <h3 className="mt-2xl mb-lg">CURRENT INVENTORY ({allProducts.length} products)</h3>
                        <div className="inventory-grid">
                            {allProducts.map((product) => (
                                <div key={product.id} className="inventory-item card card-shadow">
                                    <div className="inventory-image">
                                        <img src={product.imageUrl} alt={product.name} />
                                    </div>
                                    <div className="inventory-details">
                                        <strong>{product.name}</strong>
                                        <div className="inventory-meta">
                                            <span className="tag mt-sm">{product.type}</span>
                                            <span className="tag mt-sm">{product.stock} in stock</span>
                                        </div>
                                    </div>
                                    <button
                                        className="danger delete-btn"
                                        onClick={() => handleDeleteProduct(product.id!, product.name)}
                                        title="Delete product"
                                    >
                                        🗑️ DELETE
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .admin-page { min-height: 100vh; background: var(--white); }
        .admin-container { padding: var(--space-2xl) var(--space-lg); }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xl); padding-bottom: var(--space-lg); border-bottom: var(--border-thick) solid var(--black); }
        .admin-title { color: var(--neon-pink); }
        .tabs { display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl); border-bottom: var(--border-thick) solid var(--black); }
        .tab-btn { padding: var(--space-md) var(--space-xl); background: transparent; border: none; border-bottom: var(--border-thick) solid transparent; font-family: var(--font-heading); font-size: 1rem; cursor: pointer; transition: all 0.15s ease; }
        .tab-btn:hover { background: var(--gray-dark); color: var(--white); }
        .tab-btn.active { background: var(--black); color: var(--neon-pink); border-bottom-color: var(--neon-pink); }
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
        .delete-btn { width: 100%; padding: var(--space-sm); font-size: 0.9rem; margin-top: auto; }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .admin-header { flex-direction: column; gap: var(--space-md); align-items: flex-start); }
        }
      `}</style>
        </div>
    );
};

export default AdminPage;
