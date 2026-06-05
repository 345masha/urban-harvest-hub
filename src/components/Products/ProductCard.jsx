
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  return (
    <article className="product-card" role="article">
      <div className="product-image">
        <img src={product.image} alt={product.name} width="400" height="300" loading="lazy" />
        {product.isEcoFriendly && (
          <span className="eco-badge" aria-label="Eco-friendly product">
             Eco-Friendly
          </span>
        )}
      </div>
      
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-price">
          ${product.price}
        </div>
        
        <Link 
          to={`/products/${product.id}`}
          className="btn-details"
          aria-label={`View details of ${product.name}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;