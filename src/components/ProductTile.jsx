import { ProductCard } from './ProductCard';

export function ProductTile({ product, onAddToCart }) {
  return <ProductCard product={product} onAddToCart={onAddToCart} />;
}
