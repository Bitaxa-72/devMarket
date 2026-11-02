import { Activity, ArrowRight, BarChart3, Check, Headphones, Layers3, Palette, Search, ShoppingCart, Workflow } from 'lucide-react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { ProductCard } from '../components/ProductCard';
import { ProductGallery } from '../components/ProductGallery';
import { ProductRelated } from '../components/ProductRelated';
import { getProductGallery, getRelatedProjects } from '../data/product-media';
import { additionalServices, catalogCategoryDetails, catalogProducts, serviceCategories } from '../data/site-data';

const serviceIcons = [Search, Workflow, Palette, Headphones, Activity, BarChart3];

export function CatalogPage() {
  const { categoryId } = useParams();
  const { addToCart } = useOutletContext();
  const activeCategory = categoryId || 'all';

  const visibleProducts = activeCategory === 'all' ? catalogProducts : catalogProducts.filter((product) => product.categoryId === activeCategory);

  return (
    <main>
      <PageHero title="Готовые цифровые решения" breadcrumbs={[{ label: 'Каталог' }]} compact>
        <span className="catalog-page__result-count">Найдено {visibleProducts.length}</span>
      </PageHero>
      <section className="catalog-page">
        <div className="catalog-page__container">
          <aside className="catalog-page__sidebar">
            <h2 className="catalog-page__sidebar-title">Категории</h2>
            <Link className={`catalog-page__filter ${activeCategory === 'all' ? 'catalog-page__filter--active' : ''}`} to="/catalog">Все решения <span>{catalogProducts.length}</span></Link>
            {serviceCategories.map((category) => (
              <Link className={`catalog-page__filter ${activeCategory === category.id ? 'catalog-page__filter--active' : ''}`} to={`/catalog/${category.id}`} key={category.id}>{category.title}<span>{category.count}</span></Link>
            ))}
          </aside>
          <div className="catalog-page__content">
            {activeCategory !== 'all' && <div className="catalog-page__subcategories">{catalogCategoryDetails[activeCategory].subcategories.map((item) => <span key={item}>{item}</span>)}</div>}
            <div className="catalog-page__grid">{visibleProducts.map((product) => <ProductCard product={product} onAddToCart={addToCart} key={product.slug} />)}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProductPage() {
  const { productSlug } = useParams();
  const { addToCart, onOpenContacts } = useOutletContext();
  const product = catalogProducts.find((item) => item.slug === productSlug);

  if (!product) {
    return <main><PageHero title="Решение не найдено" breadcrumbs={[{ label: 'Каталог', to: '/catalog' }, { label: 'Не найдено' }]} compact /><div className="state-page"><Link className="ui-button ui-button--primary" to="/catalog">Перейти в каталог</Link></div></main>;
  }

  const gallery = getProductGallery(product.categoryId);
  const relatedProjects = getRelatedProjects(product.categoryId);
  const categoryDetails = catalogCategoryDetails[product.categoryId];

  return (
    <main>
      <PageHero title={product.title} breadcrumbs={[{ label: 'Каталог', to: '/catalog' }, { label: product.categoryTitle, to: `/catalog/${product.categoryId}` }, { label: product.title }]} compact />
      <section className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__showcase">
            <ProductGallery images={gallery} title={product.title} />
            <aside className="product-detail__order">
              <Layers3 size={34} strokeWidth={1.7} />
              <span className="product-detail__order-label">Готовое решение</span>
              <h2>Запустить проект</h2>
              <p>Добавьте решение в корзину или сначала обсудите адаптацию с нами.</p>
              <div className="product-detail__order-meta"><span>Стоимость</span><strong>{product.price}</strong><small>{product.leadTime}</small></div>
              <button className="ui-button ui-button--primary" type="button" onClick={(event) => addToCart(product, event.currentTarget.closest('.product-detail__order'))}><ShoppingCart size={18} />Добавить в корзину</button>
              <button className="ui-button ui-button--outline" type="button" onClick={onOpenContacts}>Обсудить задачу</button>
            </aside>
          </div>
          <section className="product-detail__description">
            <div className="product-detail__description-copy">
              <span className="section-label">О решении</span>
              <h2>{product.title} для вашего бизнеса</h2>
              <p>{product.description}</p>
              <p>{categoryDetails.overview}</p>
            </div>
            <dl className="product-detail__description-facts">
              <div><dt>Кому подходит</dt><dd>{categoryDetails.audience}</dd></div>
              <div><dt>Решает задачу</dt><dd>{categoryDetails.task}</dd></div>
              <div><dt>Результат</dt><dd>{categoryDetails.result}</dd></div>
            </dl>
          </section>
          <div className="product-detail__main">
            <span className="section-label">Что входит</span>
            <h2>Готовая основа для запуска</h2>
            <p>Адаптируем решение под ваши сценарии, фирменный стиль и необходимые интеграции. Перед стартом уточним границы проекта и закрепим их в договоре.</p>
            <div className="product-detail__features">{product.features.map((feature) => <span key={feature}><Check size={18} />{feature}</span>)}</div>
            <div className="product-detail__steps">
              {['Разбираем задачу', 'Настраиваем решение', 'Тестируем сценарии', 'Запускаем и передаём'].map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, '0')}</span><h3>{step}</h3></article>)}
            </div>
          </div>
        </div>
      </section>
      <ProductRelated projects={relatedProjects} categoryTitle={product.categoryTitle} />
    </main>
  );
}

export function ServicesPage() {
  const { onOpenContacts } = useOutletContext();

  return (
    <main>
      <PageHero title="Дополнительная экспертиза для вашего продукта" breadcrumbs={[{ label: 'Услуги' }]} compact />
      <section className="services-page">
        <div className="services-page__container">
          {additionalServices.map((service, index) => {
            const Icon = serviceIcons[index];
            return (
              <article className="service-card" key={service.title}>
                <div className="service-card__top"><span className="service-card__icon"><Icon size={23} strokeWidth={1.9} /></span><span className="service-card__benefit">{service.benefit}</span></div>
                <h2>{service.title}</h2><p>{service.description}</p>
                <ul className="service-card__features">{service.features.map((feature) => <li key={feature}><Check size={15} strokeWidth={2.4} />{feature}</li>)}</ul>
                <div className="service-card__meta"><span><small>Срок</small><strong>{service.term}</strong></span><span><small>Стоимость</small><strong>{service.price}</strong></span></div>
                <button className="service-card__action" type="button" onClick={() => onOpenContacts(service.title)}><span>{service.cta}</span><ArrowRight size={18} /></button>
              </article>
            );
          })}
          <aside className="services-page__help">
            <div><span>Не уверены в выборе?</span><h2>Разберём задачу и предложим подходящий формат</h2><p>Коротко опишите текущую ситуацию — подскажем, с какой услуги начать и какой результат можно получить.</p></div>
            <button type="button" onClick={() => onOpenContacts('Подбор услуги')}>Подобрать услугу <ArrowRight size={19} /></button>
          </aside>
        </div>
      </section>
    </main>
  );
}
