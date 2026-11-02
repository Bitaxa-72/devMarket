import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHero({ eyebrow, title, text, breadcrumbs = [], children, compact = false }) {
  return (
    <section className={`page-hero ${compact ? 'page-hero--compact' : ''}`}>
      <div className="page-hero__container">
        <nav className="page-hero__breadcrumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          {breadcrumbs.map((item) => (
            <span className="page-hero__breadcrumb" key={item.label}>
              <ChevronRight size={14} strokeWidth={2} />
              {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
            </span>
          ))}
        </nav>
        <div className="page-hero__content">
          <div>
            {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}
            <h1 className="page-hero__title">{title}</h1>
            {text && <p className="page-hero__text">{text}</p>}
          </div>
          {children && <div className="page-hero__aside">{children}</div>}
        </div>
      </div>
    </section>
  );
}
