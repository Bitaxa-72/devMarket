import { Clock3, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NewsCard({ article, image, to, grid = false }) {
  const className = grid ? 'news__card news__card--grid' : 'news__card';

  return (
    <Link className={className} to={to} aria-label={article.title}>
      <span className="news__cover">
        <img className="news__cover-image" src={image} alt="" />
        <span className="news__cover-category">{article.category}</span>
      </span>
      <span className="news__meta">
        <time dateTime={article.dateTime}>{article.date}</time>
        <span><Clock3 size={14} strokeWidth={1.8} /> {article.readingTime}</span>
        <span><Eye size={14} strokeWidth={1.8} /> {article.views}</span>
      </span>
      <h3 className="news__card-title">{article.title}</h3>
    </Link>
  );
}
