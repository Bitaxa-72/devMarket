import { ChevronRight, House } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHero({ title, breadcrumbs = [], children, compact = false }) {
  return (
    <section className={`page-hero ${compact ? 'page-hero--compact' : ''}`}>
      <div className="page-hero__container">
        <nav className="page-hero__breadcrumbs" aria-label="Хлебные крошки">
          <Link className="page-hero__home" to="/"><House className="page-hero__home-icon" size={14} strokeWidth={2} />Главная</Link>
          {breadcrumbs.map((item) => (
            <span className={`page-hero__breadcrumb ${item.to ? 'page-hero__breadcrumb--link' : 'page-hero__breadcrumb--current'}`} key={item.label}>
              <ChevronRight size={14} strokeWidth={2} />
              {item.to ? <Link className="page-hero__breadcrumb-link" to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
            </span>
          ))}
        </nav>
        <div className="page-hero__content">
          <div>
            <h1 className="page-hero__title">{title}</h1>
          </div>
          {children && <div className="page-hero__aside">{children}</div>}
        </div>
        <span className="page-hero__divider"><span className="page-hero__divider-accent" /></span>
      </div>
    </section>
  );
}
