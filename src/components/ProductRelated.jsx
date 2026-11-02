import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProjectCover } from '../data/product-media';

export function ProductRelated({ projects, categoryTitle }) {
  return (
    <section className="product-related" aria-labelledby="product-related-title">
      <div className="product-related__container">
        <div className="product-related__heading">
          <div><span className="section-label">Портфолио по направлению</span><h2 id="product-related-title">Похожие задачи уже решали</h2></div>
          <p>Проекты из направления «{categoryTitle}» и близких по задаче решений.</p>
        </div>
        <div className="product-related__grid">
          {projects.map((project) => (
            <Link className="portfolio-card" to={`/projects/${project.slug}`} aria-label={`Открыть проект «${project.title}»`} key={project.slug}>
              <span className="portfolio-card__visual"><img src={getProjectCover(project.slug)} alt="" loading="lazy" /><span>{project.year}</span></span>
              <span className="portfolio-card__body"><span>{project.category}</span><h2>{project.title}</h2><p>{project.description}</p><span className="portfolio-card__footer"><strong>{project.result}</strong><span className="portfolio-card__arrow"><ArrowUpRight size={20} /></span></span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
