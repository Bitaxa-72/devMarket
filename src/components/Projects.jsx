import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

export function Projects({ onOpenContacts }) {
  const trackRef = useRef(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);

  const updateControls = () => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    setCanScrollBack(track.scrollLeft > 4);
    setCanScrollForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  };

  useEffect(() => {
    updateControls();
    window.addEventListener('resize', updateControls);
    return () => window.removeEventListener('resize', updateControls);
  }, []);

  const scrollProjects = (direction) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const card = track.querySelector('.projects__card');
    const distance = card ? card.getBoundingClientRect().width + 24 : 360;
    track.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  return (
    <section className="projects" id="projects" aria-labelledby="projects-title">
      <div className="projects__container">
        <div className="projects__header">
          <div>
            <span className="projects__eyebrow">Наши проекты</span>
            <h2 className="projects__title" id="projects-title">Реализованные решения</h2>
          </div>
          <div className="projects__controls" aria-label="Навигация по проектам">
            <button className="projects__control" type="button" aria-label="Предыдущие проекты" disabled={!canScrollBack} onClick={() => scrollProjects(-1)}>
              <ArrowLeft size={30} strokeWidth={2.1} />
            </button>
            <button className="projects__control" type="button" aria-label="Следующие проекты" disabled={!canScrollForward} onClick={() => scrollProjects(1)}>
              <ArrowRight size={30} strokeWidth={2.1} />
            </button>
          </div>
        </div>
        <div className="projects__layout">
          <article className="projects__summary">
            <strong className="projects__count">20+</strong>
            <h3 className="projects__summary-title">проектов запущено</h3>
            <p className="projects__summary-text">Создаём цифровые продукты для продаж, автоматизации и развития бизнеса.</p>
            <button className="projects__summary-button" type="button" onClick={onOpenContacts}>Обсудить свой проект</button>
          </article>
          <div className="projects__track" ref={trackRef} onScroll={updateControls}>
            {projects.map((project, index) => (
              <Link
                className="projects__card"
                to={`/projects/project-${index + 1}`}
                aria-label={`Подробнее о проекте «${project.title}»`}
                key={project.title}
              >
                <div className="projects__preview" aria-hidden="true">
                  {project.image ? (
                    <img className="projects__preview-image" src={project.image} alt="" />
                  ) : (
                    <span className="projects__preview-brand">
                      <span className="projects__preview-brand-lockup">
                        <span className="projects__preview-brand-mark">D</span>
                        <span className="projects__preview-brand-name">devmarket</span>
                      </span>
                      <span className="projects__preview-brand-category">{project.category}</span>
                    </span>
                  )}
                </div>
                <div className="projects__card-body">
                  <span className="projects__category">{project.category}</span>
                  <h3 className="projects__card-title">{project.title}</h3>
                  <p className="projects__description">{project.description}</p>
                  <div className="projects__tags">
                    {project.tags.map((tag) => <span className="projects__tag" key={tag}>{tag}</span>)}
                  </div>
                  <div className="projects__card-footer">
                    <strong className="projects__result">{project.result}</strong>
                    <span className="projects__link" aria-hidden="true"><ArrowUpRight size={19} strokeWidth={2.2} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
