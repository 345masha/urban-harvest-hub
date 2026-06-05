// Location: urban-harvest-hub/src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { productsAPI, bookingsAPI } from '../services/api';
import ProductCard from '../components/Products/ProductCard';
import CategoryFilter from '../components/Common/CategoryFilter';
import { lazy, Suspense } from 'react';
const Modal = lazy(() => import('../components/UI/Modal'));
import './ProductsPage.css';

function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');

  // Cart & Wishlist drawers
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);

  // Cart Checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [chkName, setChkName] = useState('');
  const [chkEmail, setChkEmail] = useState('');
  const [chkPhone, setChkPhone] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const syncCartAndWishlist = () => {
    setCart(JSON.parse(localStorage.getItem('shopping_cart') || '[]'));
    setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
  };

  useEffect(() => {
    syncCartAndWishlist();
    // Listen to local changes
    window.addEventListener('storage', syncCartAndWishlist);
    return () => window.removeEventListener('storage', syncCartAndWishlist);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getAll(activeCategory, searchTerm);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [activeCategory, searchTerm]);

  // Sort and filter client-side
  useEffect(() => {
    let sorted = [...products];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredProducts(sorted);
  }, [products, sortBy]);

  // Cart helpers
  const updateCartQty = (id, newQty) => {
    if (newQty < 1) return;
    const updated = cart.map(item => item.id === id ? { ...item, quantity: newQty } : item);
    setCart(updated);
    localStorage.setItem('shopping_cart', JSON.stringify(updated));
  };

  const removeFromCart = (id) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('shopping_cart', JSON.stringify(updated));
  };

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const triggerCheckout = () => {
    setCheckoutError('');
    setCheckoutSuccess(false);
    
    // Autofill from user session if logged in
    const loggedInUser = JSON.parse(localStorage.getItem('user_session') || '{}');
    setChkName(loggedInUser.name || '');
    setChkEmail(loggedInUser.email || '');
    
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!chkName.trim() || !chkEmail.trim()) {
      setCheckoutError(t('validEmail'));
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      // Loop over items and create booking for each
      for (const item of cart) {
        await bookingsAPI.create({
          name: chkName.trim(),
          email: chkEmail.trim(),
          phone: chkPhone.trim(),
          itemType: 'product',
          itemId: item.id,
          itemName: item.name,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          specialRequests: `Product order of ${item.quantity}x ${item.name}`
        });

        // Decrement stock in our product state
        setProducts(prev => prev.map(p => {
          if (p.id === item.id) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        }));
      }

      setCheckoutSuccess(true);
      // Clear cart
      localStorage.setItem('shopping_cart', '[]');
      setCart([]);
      
      setTimeout(() => {
        setShowCheckoutModal(false);
        setShowCartDrawer(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setCheckoutError('Failed to process purchase order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        {/* Floating Utilities */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-45">
          {/* Cart trigger */}
          <button
            onClick={() => setShowCartDrawer(true)}
            className="h-14 w-14 rounded-full bg-forest-600 hover:bg-forest-700 text-white flex items-center justify-center shadow-2xl relative border-2 border-white hover:scale-105 transition"
            title="Open Shopping Cart"
          >
            <span>🛒</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center shadow text-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Wishlist trigger */}
          <button
            onClick={() => setShowWishlistDrawer(true)}
            className="h-14 w-14 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center shadow-2xl border border-slate-200 dark:border-slate-800 hover:scale-105 transition"
            title="Open Wishlist"
          >
            <span>❤️</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-forest-600 rounded-full text-[9px] font-bold flex items-center justify-center shadow text-white">
                {wishlist.length}
              </span>
            )}
          </button>
        </div>

        {/* Page Header */}
        <header className="mb-10 text-center" role="banner">
          <h1 className="text-4xl md:text-5xl font-extrabold text-forest-800 dark:text-sage-300 mb-3 tracking-tight font-poppins">
            {t('ecoProducts')}
          </h1>
          <p className="text-lg text-slate-655 dark:text-slate-450 max-w-xl mx-auto">
            {t('chooseSustainable')}
          </p>
        </header>

        {/* Search and Sort controls */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2.5">
            <input
              type="search"
              placeholder={`${t('searchPlaceholder')}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 focus:outline-none focus:ring-2 focus:ring-forest-600 flex-1 glass-card text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs font-semibold cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating Score</option>
            </select>
          </div>

          <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>

        {/* Grid of products */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 4, 5].map(n => (
              <div key={n} className="h-80 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 shadow-md"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-bold">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-2xl glass-card">
            <p className="text-slate-500 dark:text-slate-450 font-semibold">{t('noResults')}</p>
          </div>
        )}
      </div>

      {/* SHOPPING CART DRAWER */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in bg-black/40 backdrop-blur-sm">
          <div
            onClick={() => setShowCartDrawer(false)}
            className="absolute inset-0"
          ></div>
          
          <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 glass-card border-l border-white/20 dark:border-slate-850 h-full p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-6">
                <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🛒</span> {t('cartTitle')}
                </h3>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full flex items-center justify-center font-bold"
                >
                  ×
                </button>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 scrollbar-thin">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/35 border border-slate-200/50 dark:border-slate-800/50 text-xs"
                    >
                      <img src={item.image} alt={item.name} width="48" height="48" loading="lazy" className="h-12 w-12 rounded object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-850 dark:text-white truncate">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold">${item.price} each</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateCartQty(item.id, item.quantity - 1)} className="px-1.5 py-0.5 border rounded hover:bg-white">-</button>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, item.quantity + 1)} className="px-1.5 py-0.5 border rounded hover:bg-white">+</button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-forest-700 dark:text-sage-400">${(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] text-red-500 mt-2 font-bold"
                        >
                          {t('adminDeleteBtn')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">
                  {t('emptyCart')}
                </p>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-200/55 dark:border-slate-800/55 pt-4">
                <div className="flex justify-between items-center text-sm font-black mb-4">
                  <span>Total Amount:</span>
                  <span className="text-lg text-forest-750 dark:text-sage-350">${getCartTotal()}</span>
                </div>
                <button
                  onClick={triggerCheckout}
                  className="w-full py-3 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-xl transition text-xs shadow-md uppercase tracking-wider"
                >
                  💳 {t('checkout')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER */}
      {showWishlistDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in bg-black/40 backdrop-blur-sm">
          <div
            onClick={() => setShowWishlistDrawer(false)}
            className="absolute inset-0"
          ></div>

          <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 glass-card border-l border-white/20 dark:border-slate-850 h-full p-6 shadow-2xl flex flex-col transition-transform duration-300">
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-6">
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
                <span>❤️</span> {t('wishlistTitle')}
              </h3>
              <button
                onClick={() => setShowWishlistDrawer(false)}
                className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            {wishlist.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-150px)] pr-2 scrollbar-thin">
                {wishlist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/35 border border-slate-200/50 dark:border-slate-800/50 text-xs"
                  >
                    <img src={item.image} alt={item.name} width="48" height="48" loading="lazy" className="h-12 w-12 rounded object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-850 dark:text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">${item.price}</p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => {
                          // Copy item to cart with quantity 1
                          const cartData = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
                          if (!cartData.some(i => i.id === item.id)) {
                            cartData.push({ ...item, quantity: 1 });
                            localStorage.setItem('shopping_cart', JSON.stringify(cartData));
                            setCart(cartData);
                          }
                          removeFromWishlist(item.id);
                          alert('Moved to cart!');
                        }}
                        className="px-2.5 py-1 text-[9px] font-bold bg-forest-600 text-white rounded hover:bg-forest-750"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-[9px] text-red-500 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center">
                {t('emptyWishlist')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT BOOKINGS FORM MODAL */}
      {showCheckoutModal && (
        <Suspense fallback={null}>
          <Modal
            title={t('checkout')}
            onClose={() => setShowCheckoutModal(false)}
          >
            {checkoutSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl text-green-500 mb-3">✓</div>
                <h3 className="font-bold text-lg mb-2">Order Confirmed!</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  Thank you for your purchase. We are processing your delivery!
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {checkoutError && (
                  <div className="p-3 text-xs bg-red-50 text-red-500 rounded-lg">{checkoutError}</div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('name')} *</label>
                  <input
                    type="text"
                    required
                    value={chkName}
                    onChange={(e) => setChkName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('email')} *</label>
                  <input
                    type="email"
                    required
                    value={chkEmail}
                    onChange={(e) => setChkEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('phone')}</label>
                  <input
                    type="tel"
                    value={chkPhone}
                    onChange={(e) => setChkPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 font-bold transition text-xs"
                  >
                    {t('back')}
                  </button>
                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="flex-1 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-bold transition text-xs"
                  >
                    {isCheckingOut ? t('loading') : 'Place Order'}
                  </button>
                </div>
              </form>
            )}
          </Modal>
        </Suspense>
      )}
    </div>
  );
}

export default ProductsPage;