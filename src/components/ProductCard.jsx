import { Clock3, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <Link className="product-card__link" to={`/product/${product.slug}`} aria-label={`Открыть ${product.title}`}>
        <div className="product-card__cover">
          {product.image ? (
            <img className="product-card__image" src={product.image} alt={product.title} />
          ) : (
            <div className="product-card__brand">
              <span className="product-card__brand-lockup" aria-hidden="true">
                <span className="product-card__brand-mark">D</span>
                <span className="product-card__brand-name">devmarket</span>
              </span>
              <span className="product-card__cover-category">{product.categoryTitle}</span>
            </div>
          )}
        </div>
        <div className="product-card__body">
          <h3 className="product-card__title">{product.title}</h3>
          <p className="product-card__description">{product.description}</p>
          <div className="product-card__footer">
            <span className="product-card__time"><Clock3 size={15} strokeWidth={1.8} /> {product.leadTime}</span>
            <strong className="product-card__price">{product.price}</strong>
          </div>
        </div>
      </Link>
      <button className="product-card__cart" type="button" onClick={(event) => onAddToCart(product, event.currentTarget.closest('.product-card'))}><ShoppingCart size={18} strokeWidth={2} /><span>Добавить в корзину</span></button>
    </article>
  );
}
