
import { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import CategoryFilter from '../Common/CategoryFilter';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';
import { fetchProducts } from '../../utils/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  // Fetch products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products;
    }
    return products.filter(product => product.category === activeCategory);
  }, [products, activeCategory]);

  const handleBooking = (product) => {
    // Navigate to booking page
    window.location.href = `/booking/product/${product.id}`;
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="error-container" role="alert">
        <p>{error}</p>
        <button onClick={loadProducts} className="btn-retry">
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <section 
      className="products-section" 
      aria-label="Eco-friendly products catalog"
    >
      <div className="section-header">
        <h2>{t('sustainableProducts')}</h2>
        <p>{t('productsDescription')}</p>
      </div>
      
      <CategoryFilter 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <div 
        className="products-grid" 
        role="list"
        id="content-panel"
        aria-live="polite"
      >
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onBook={handleBooking}
          />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="no-results" role="alert">
          <p>{t('noProductsFound')}</p>
          <button 
            onClick={() => setActiveCategory('all')}
            className="btn-reset"
          >
            {t('showAllProducts')}
          </button>
        </div>
      )}
    </section>
  );
}