import { useEffect, useRef, useState } from 'react';
import { catalogCategories } from '../data/catalog-products';
import { ProductCard } from './ProductCard';

export function Catalog({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState(catalogCategories[0]);
  const [displayedCategory, setDisplayedCategory] = useState(catalogCategories[0]);
  const [isSwitching, setIsSwitching] = useState(false);
  const switchTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(switchTimer.current), []);

  const selectCategory = (category) => {
    if (category.id === activeCategory.id) {
      return;
    }

    window.clearTimeout(switchTimer.current);
    setActiveCategory(category);
    setIsSwitching(true);
    switchTimer.current = window.setTimeout(() => {
      setDisplayedCategory(category);
      setIsSwitching(false);
    }, 150);
  };

  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="catalog__heading-container">
        <div className="catalog__heading">
          <div>
            <span className="catalog__eyebrow">Каталог</span>
            <h2 className="catalog__title" id="catalog-title">Готовые решения для запуска</h2>
          </div>
          <p className="catalog__intro">Выберите основу для запуска или адаптируем решение под ваш процесс.</p>
        </div>
      </div>
      <div className="catalog__tabs" role="tablist" aria-label="Категории каталога">
        <div className="catalog__tabs-container">
          {catalogCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory.id === category.id;

            return (
              <button className={`catalog__tab ${isActive ? 'catalog__tab--active' : ''}`} type="button" role="tab" aria-selected={isActive} key={category.id} onClick={() => selectCategory(category)}>
                <Icon className="catalog__tab-icon" size={40} strokeWidth={1.7} />
                <span className="catalog__tab-content">
                  <span className="catalog__tab-title">{category.title}</span>
                  <span className="catalog__tab-description">{category.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="catalog__showcase">
        <div className="catalog__products-container">
          <div className={`catalog__panel ${isSwitching ? 'catalog__panel--switching' : ''}`} aria-busy={isSwitching}>
            <h3 className="catalog__category-title">{displayedCategory.title}</h3>
            <div className="catalog__products" role="tabpanel">
              {displayedCategory.products.map((product, index) => <ProductCard product={{ ...product, slug: `${displayedCategory.id}-${index + 1}`, categoryTitle: displayedCategory.title }} onAddToCart={onAddToCart} key={product.title} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
