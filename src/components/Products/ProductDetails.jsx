// Location: urban-harvest-hub/src/components/Products/ProductDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { productsAPI } from '../../services/api';
import BookingForm from '../Common/BookingForm';
import './ProductDetails.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  
  // Cart & Wishlist state
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Review submission form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadProductData = async () => {
    setLoading(true);
    try {
      const prod = await productsAPI.getById(id);
      if (prod) {
        setProduct(prod);
        const revs = await productsAPI.getReviews(id);
        setReviews(revs);
        
        // Check cart & wishlist status from LocalStorage
        const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setInCart(cart.some(item => item.id === prod.id));
        setInWishlist(wishlist.some(item => item.id === prod.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
    const existingIdx = cart.findIndex(item => item.id === product.id);
    
    if (existingIdx > -1) {
      cart[existingIdx].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
    setInCart(true);
    alert(`${product.name} added to cart!`);
    // Dispatch storage event to update Header count
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.some(item => item.id === product.id);
    
    if (exists) {
      wishlist = wishlist.filter(item => item.id !== product.id);
      setInWishlist(false);
    } else {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      setInWishlist(true);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('storage'));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      setReviewError(t('required'));
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const result = await productsAPI.createReview(id, {
        user_name: reviewerName.trim(),
        rating: Number(reviewRating),
        comment: reviewComment.trim()
      });

      if (result) {
        setReviewSuccess(true);
        setReviewerName('');
        setReviewComment('');
        setReviewRating(5);
        
        // Reload reviews & update product score
        const revs = await productsAPI.getReviews(id);
        setReviews(revs);
        const prod = await productsAPI.getById(id);
        setProduct(prod);
      }
    } catch (err) {
      setReviewError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-600"></div>
        <p className="text-slate-500">{t('loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Product not found</h2>
        <button onClick={() => navigate('/products')} className="px-5 py-2.5 bg-forest-600 hover:bg-forest-750 text-white rounded-xl transition">
          {t('backTo')} {t('products')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 text-slate-800 dark:text-slate-100">
      <button onClick={() => navigate(-1)} className="px-4 py-2 mb-8 text-xs font-bold border border-slate-300 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
        ← {t('back')}
      </button>

      {/* Main product detail container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white/70 dark:bg-slate-900/70 p-6 md:p-8 rounded-3xl border border-white/20 dark:border-slate-850 shadow-xl glass-card animate-fade-in mb-12">
        {/* Product Image */}
        <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-[480px] aspect-square">
          <img src={product.image} alt={product.name} width="800" height="600" className="w-full h-full object-cover" />
        </div>

        {/* Product Details Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-forest-100 dark:bg-forest-900/50 text-forest-800 dark:text-forest-200">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-green-600 text-white shadow">
                {t('ecoFriendly')}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold font-poppins text-slate-900 dark:text-white tracking-tight mb-2">
              {product.name}
            </h1>

            {/* Stars rating */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <div className="text-yellow-400 text-base">
                {'★'.repeat(Math.round(product.rating || 4))}
                {'☆'.repeat(5 - Math.round(product.rating || 4))}
              </div>
              <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
                ({reviews.length || product.reviews || 0} {t('reviews')})
              </span>
            </div>

            <p className="text-3xl font-black text-forest-700 dark:text-sage-300 mb-6">
              ${product.price}
            </p>

            <p className="text-sm leading-relaxed text-slate-655 dark:text-slate-400 mb-6">
              {product.fullDescription || product.description}
            </p>

            {/* Eco Features checklist */}
            {product.ecoFeatures && (
              <div className="mb-6 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('ecoFeatures')}
                </h3>
                <ul className="text-xs space-y-1.5">
                  {product.ecoFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 font-medium">
                      <span className="text-green-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock indicators */}
            <div className="mb-6 text-xs font-semibold">
              {product.stock > 0 ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5">
                  ● {t('inStock')} ({product.stock} {t('available')})
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400">
                  ● {t('outOfStock')}
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase">{t('quantity')}</span>
                <div className="flex items-center border border-slate-350 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1.5 text-xs hover:bg-slate-100 font-bold">-</button>
                  <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-1.5 text-xs hover:bg-slate-100 font-bold">+</button>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-bold rounded-xl transition text-xs shadow-md uppercase tracking-wider"
              >
                🛒 {t('addToCart')}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`px-6 py-3 border font-bold rounded-xl transition text-xs uppercase tracking-wider ${
                  inWishlist
                    ? 'border-red-500 text-red-500 bg-red-50/50 hover:bg-red-50'
                    : 'border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {inWishlist ? '❤️ ' + t('inWishlist') : '🤍 ' + t('addToWishlist')}
              </button>

              <button
                onClick={() => setShowBooking(true)}
                disabled={product.stock === 0}
                className="py-3 px-5 border border-forest-600 hover:bg-forest-50/20 text-forest-750 dark:text-sage-300 font-bold rounded-xl transition text-xs uppercase tracking-wider disabled:opacity-50"
              >
                📬 {t('bookNow')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of reviews */}
        <div className="lg:col-span-2 glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850">
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white mb-6">
            💬 {t('customerReviews')} ({reviews.length})
          </h2>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(rev => (
                <div key={rev.id} className="border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">{rev.user_name}</h4>
                      <div className="text-xs text-yellow-400">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-400">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>

        {/* Submit review sidebar */}
        <div className="lg:col-span-1 glass-card bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/20 dark:border-slate-850 h-fit">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            ✍️ {t('writeReview')}
          </h2>

          {reviewSuccess ? (
            <div className="p-4 bg-green-50 text-green-700 text-xs rounded-xl text-center font-bold">
              Review submitted successfully! Thank you.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {reviewError && (
                <div className="p-3 bg-red-50 text-red-500 text-xs rounded-lg">{reviewError}</div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('name')} *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Anonymous User"
                  className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('rating')} *</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value={5}>★★★★★ (5/5)</option>
                  <option value={4}>★★★★☆ (4/5)</option>
                  <option value={3}>★★★☆☆ (3/5)</option>
                  <option value={2}>★★☆☆☆ (2/5)</option>
                  <option value={1}>★☆☆☆☆ (1/5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">{t('specialRequests')} (Comment) *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t('reviewPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-lg transition text-xs"
              >
                {submittingReview ? t('loading') : t('submitReview')}
              </button>
            </form>
          )}
        </div>
      </div>

      {showBooking && (
        <BookingForm
          item={product}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}

export default ProductDetail;