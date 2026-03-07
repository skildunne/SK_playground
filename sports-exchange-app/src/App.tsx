import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';

// TypeScript Interfaces based on our Prisma schema
interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    imageUrl: string | null;
    status: string;
    seller: { id: string; email: string };
}

// Ensure Axios uses the Env variable we set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Home = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="bg-slate-card/60 backdrop-blur-xl p-12 rounded-3xl border border-white/5 shadow-2xl max-w-3xl transform transition-all hover:scale-[1.02]">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Circular Economy
                <br /> Gear Exchange
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto font-body leading-relaxed">
                The most sustainable way to source and trade premium sporting equipment. Join the autonomous swarm network today.
            </p>
            <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-primary text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(19,236,164,0.4)] hover:shadow-[0_0_30px_rgba(19,236,164,0.6)]"
            >
                <span>Browse the Marketplace</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </Link>
        </div>
    </div>
);

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart, cart } = useCart(); // Access cart hooks

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/products`);
                setProducts(response.data);
            } catch (err) {
                setError('Failed to load marketplace inventory. Make sure the backend is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        addToCart({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            sellerId: product.seller.id,
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Live Marketplace</h1>
                    <p className="text-gray-400">Discover and source verified equipment</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    NETWORK ONLINE
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
                    <p className="text-lg">⚠️ {error}</p>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-slate-card/40 border border-white/5 p-12 rounded-3xl text-center">
                    <div className="text-6xl mb-4 opacity-50">🏕️</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Inventory Empty</h3>
                    <p className="text-gray-500">No sellers have listed items yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="group bg-slate-card rounded-2xl border border-white/5 overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                        >
                            {/* Image Placeholder or Actual Image */}
                            <div className="h-48 bg-background-dark relative overflow-hidden flex items-center justify-center">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                        <span className="text-4xl opacity-20">📦</span>
                                    </div>
                                )}
                                {/* Condition Badge */}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-gray-300 text-xs px-2.5 py-1 rounded-full border border-white/10 font-medium">
                                    {product.condition}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                                    <span className="text-xl font-display font-bold text-white">${product.price.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{product.description}</p>

                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                            {product.seller.email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs text-gray-500 truncate w-24">{product.seller.email}</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        disabled={cart.some(item => item.id === product.id)}
                                        className="flex items-center justify-center bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_15px_rgba(19,236,164,0.3)]"
                                    >
                                        {cart.some(item => item.id === product.id) ? 'In Cart' : 'Add to Cart 🛒'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const { cart, cartTotal, removeFromCart } = useCart();
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <Router>
            <div className="min-h-screen bg-background-dark text-white font-body selection:bg-primary/30 selection:text-white flex flex-col md:flex-row">

                {/* Modern Sidebar */}
                <aside className="w-full md:w-80 bg-slate-card border-r border-white/5 md:min-h-screen flex flex-col sticky top-0 z-50">
                    <div className="p-6">
                        <Link to="/" className="flex items-center gap-3 mb-10 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(19,236,164,0.3)] group-hover:shadow-[0_0_20px_rgba(19,236,164,0.5)] transition-all">
                                <span className="text-xl">♻️</span>
                            </div>
                            <h1 className="font-display font-bold text-xl tracking-tight text-white">GearX Network</h1>
                        </Link>

                        <nav className="space-y-1 mb-8">
                            <Link
                                to="/"
                                className="flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg opacity-80">🏠</span>
                                    <span className="font-medium">Dashboard</span>
                                </div>
                            </Link>
                            <Link
                                to="/products"
                                className="flex items-center justify-between px-4 py-3 bg-white/5 text-white rounded-xl border border-white/5 transition-all shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg text-primary">🛍️</span>
                                    <span className="font-medium">Marketplace</span>
                                </div>
                            </Link>
                        </nav>

                        {/* Shopping Cart Section embedded in Sidebar */}
                        <div className="mt-8 border-t border-white/5 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display font-medium text-gray-300">Your Cart</h3>
                                <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{cart.length} items</span>
                            </div>

                            <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="text-sm text-gray-600 text-center py-4 bg-background-dark/50 rounded-xl border border-white/5 border-dashed">
                                        Cart is empty.
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.id} className="bg-background-dark rounded-xl p-3 border border-white/5 flex gap-3 group relative">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-xl">📦</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{item.title}</h4>
                                                <p className="text-xs text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-end mb-4 px-1">
                                        <span className="text-sm text-gray-400">Total</span>
                                        <span className="text-xl font-display font-bold text-white">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <Link to="/checkout" className="w-full bg-primary hover:bg-emerald-300 text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(19,236,164,0.3)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2">
                                        <span className="text-lg">Proceed to Checkout</span>
                                        <span>💳</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="mt-auto p-6">
                        <div className="bg-background-dark/80 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account</span>
                                {isAuthenticated ? (
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Online
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Guest</span>
                                )}
                            </div>
                            {isAuthenticated ? (
                                <div>
                                    <div className="text-sm text-white truncate max-w-[200px] mb-2">{user?.email}</div>
                                    <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 transition-colors">Sign Out</button>
                                </div>
                            ) : (
                                <Link to="/login" className="text-sm text-primary font-medium cursor-pointer hover:underline">
                                    Sign In to Sell/Buy
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Global Main Content */}
                <main className="flex-1 p-4 md:p-8 lg:p-12 h-screen overflow-y-auto custom-scrollbar">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
