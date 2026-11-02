import { ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Eye, Gift, Tag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { NewsCard } from '../components/NewsCard';
import { PageHero } from '../components/PageHero';
import { newsImagesBySlug } from '../data/news-media';
import { projectGalleryBySlug, projectImageList } from '../data/project-media';
import { portfolioProjects, promotions, publications } from '../data/site-data';

const NEWS_BATCH_SIZE = 12;

export function ProjectsPage() {
  const categories = ['Все', ...new Set(portfolioProjects.map((project) => project.category))];
  const [activeCategory, setActiveCategory] = useState('Все');
  const visibleProjects = activeCategory === 'Все' ? portfolioProjects : portfolioProjects.filter((project) => project.category === activeCategory);

  return (
    <main>
      <PageHero eyebrow="Портфолио" title="Проекты, которые уже работают" text="Показываем не только интерфейс, но и задачу, подход и результат для бизнеса." breadcrumbs={[{ label: 'Наши проекты' }]} compact />
      <section className="portfolio-page">
        <div className="portfolio-page__container">
          <div className="filter-tabs">{categories.map((category) => <button className={activeCategory === category ? 'filter-tabs__button filter-tabs__button--active' : 'filter-tabs__button'} type="button" key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
          <div className="portfolio-page__grid">
            {visibleProjects.map((project, index) => (
              <Link className="portfolio-card" to={`/projects/${project.slug}`} aria-label={`Открыть проект «${project.title}»`} key={project.slug}>
                <span className="portfolio-card__visual"><img src={projectImageList[index % projectImageList.length]} alt="" loading="lazy" /><span>{project.year}</span></span>
                <span className="portfolio-card__body"><span>{project.category}</span><h2>{project.title}</h2><p>{project.description}</p><span className="portfolio-card__footer"><strong>{project.result}</strong><span className="portfolio-card__arrow"><ArrowUpRight size={20} /></span></span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ProjectPage() {
  const { projectSlug } = useParams();
  const { onOpenContacts } = useOutletContext();
  const project = portfolioProjects.find((item) => item.slug === projectSlug);
  const [activeSlide, setActiveSlide] = useState(0);
  const gallery = projectGalleryBySlug[projectSlug] || projectImageList.slice(0, 3);

  useEffect(() => setActiveSlide(0), [projectSlug]);

  useEffect(() => {
    const autoplayTimer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % gallery.length), 6000);
    return () => window.clearInterval(autoplayTimer);
  }, [gallery.length, projectSlug]);

  if (!project) {
    return <main><PageHero eyebrow="Портфолио" title="Проект не найден" breadcrumbs={[{ label: 'Наши проекты', to: '/projects' }, { label: 'Не найдено' }]} compact /><div className="state-page"><Link className="ui-button ui-button--primary" to="/projects">Вернуться к проектам</Link></div></main>;
  }

  return (
    <main>
      <PageHero eyebrow={project.category} title={project.title} text={project.description} breadcrumbs={[{ label: 'Наши проекты', to: '/projects' }, { label: project.title }]}>
        <div className="case-result"><span>Стоимость разработки</span><strong>{project.price}</strong><small>{project.result} · {project.year}</small></div>
      </PageHero>
      <section className="case-page">
        <div className="case-page__container">
          <div className="case-page__gallery" data-autoplay-interval="6000">
            <div className="case-page__gallery-stage">
              <img src={gallery[activeSlide]} alt={`${project.title} — экран ${activeSlide + 1}`} />
              <button className="case-page__gallery-control case-page__gallery-control--previous" type="button" aria-label="Предыдущий экран" onClick={() => setActiveSlide((activeSlide - 1 + gallery.length) % gallery.length)}><ChevronLeft size={22} /></button>
              <button className="case-page__gallery-control case-page__gallery-control--next" type="button" aria-label="Следующий экран" onClick={() => setActiveSlide((activeSlide + 1) % gallery.length)}><ChevronRight size={22} /></button>
              <span className="case-page__gallery-counter">{activeSlide + 1} / {gallery.length}</span>
            </div>
          </div>
          <div className="case-page__story">
            <article><span>01</span><div><h2>Задача</h2><p>{project.challenge}</p></div></article>
            <article><span>02</span><div><h2>Решение</h2><p>{project.solution}</p></div></article>
            <article><span>03</span><div><h2>Результат</h2><div className="case-page__impact">{project.impact.map((item) => <span key={item}><Check size={18} />{item}</span>)}</div></div></article>
            <div className="case-page__facts"><span><small>Стоимость</small><strong>{project.price}</strong></span><span><small>Срок</small><strong>{project.term}</strong></span><span><small>Год</small><strong>{project.year}</strong></span></div>
            <div className="case-page__tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="case-page__actions"><a className="ui-button ui-button--outline" href={project.url} target="_blank" rel="noreferrer">Смотреть проект <ArrowUpRight size={18} /></a><button className="ui-button ui-button--primary" type="button" onClick={onOpenContacts}>Хочу похожий проект</button></div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PromotionsPage() {
  const { onOpenContacts } = useOutletContext();

  return (
    <main>
      <PageHero eyebrow="Акции" title="Выгодные условия для запуска" text="Специальные предложения для новых проектов и комплексных задач." breadcrumbs={[{ label: 'Акции' }]} compact />
      <section className="promotions-page">
        <div className="promotions-page__container">
          {promotions.map((promotion, index) => (
            <article className={`promotion-card promotion-card--${index + 1}`} key={promotion.title}>
              <div className="promotion-card__icon"><Gift size={34} strokeWidth={1.7} /></div>
              <span className="promotion-card__badge">{promotion.badge}</span>
              <h2>{promotion.title}</h2><p>{promotion.description}</p>
              <div className="promotion-card__footer"><span><CalendarDays size={16} />{promotion.deadline}</span><button type="button" onClick={onOpenContacts}>Получить предложение <ArrowRight size={18} /></button></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function NewsPage() {
  const categories = ['Все', ...new Set(publications.map((article) => article.category))];
  const [activeCategory, setActiveCategory] = useState('Все');
  const [visibleCount, setVisibleCount] = useState(NEWS_BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef(null);
  const loadingRef = useRef(false);
  const filteredArticles = activeCategory === 'Все' ? publications : publications.filter((article) => article.category === activeCategory);
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  useEffect(() => {
    setVisibleCount(NEWS_BATCH_SIZE);
    setIsLoading(false);
    loadingRef.current = false;
  }, [activeCategory]);

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return undefined;
    let loadTimer;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);
      loadTimer = window.setTimeout(() => {
        setVisibleCount((count) => count + NEWS_BATCH_SIZE);
        setIsLoading(false);
        loadingRef.current = false;
      }, 300);
    }, { rootMargin: '240px 0px' });
    observer.observe(loadMoreRef.current);
    return () => {
      observer.disconnect();
      window.clearTimeout(loadTimer);
    };
  }, [activeCategory, hasMore]);

  return (
    <main>
      <PageHero eyebrow="Медиа" title="Новости и полезные материалы" text="Практика разработки, автоматизации и запуска цифровых продуктов." breadcrumbs={[{ label: 'Новости' }]} compact />
      <section className="articles-page">
        <div className="articles-page__container">
          <div className="articles-page__categories filter-tabs" aria-label="Категории новостей">
            {categories.map((category) => <button className={activeCategory === category ? 'filter-tabs__button filter-tabs__button--active' : 'filter-tabs__button'} type="button" aria-pressed={activeCategory === category} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <div className="articles-page__grid" data-batch-size={NEWS_BATCH_SIZE}>
            {visibleArticles.map((article) => <NewsCard article={article} image={newsImagesBySlug[article.slug]} to={`/news/${article.slug}`} grid key={article.slug} />)}
          </div>
          {hasMore && <div className="articles-page__loader" ref={loadMoreRef} aria-live="polite">{isLoading && <span role="status"><i />Загружаем ещё новости</span>}</div>}
        </div>
      </section>
    </main>
  );
}

export function ArticlePage() {
  const { articleSlug } = useParams();
  const article = publications.find((item) => item.slug === articleSlug);

  if (!article) {
    return <main><PageHero eyebrow="Новости" title="Материал не найден" breadcrumbs={[{ label: 'Новости', to: '/news' }, { label: 'Не найдено' }]} compact /><div className="state-page"><Link className="ui-button ui-button--primary" to="/news">Вернуться к новостям</Link></div></main>;
  }

  return (
    <main>
      <PageHero eyebrow={article.category} title={article.title} text={article.excerpt} breadcrumbs={[{ label: 'Новости', to: '/news' }, { label: article.title }]} compact />
      <article className="article-page">
        <div className="article-page__meta"><time dateTime={article.dateTime}>{article.date}</time><span><Clock3 size={15} />{article.readingTime}</span><span><Eye size={15} />{article.views}</span></div>
        <div className={`article-page__cover article-page__cover--${article.accent}`}><Tag size={78} strokeWidth={1.3} /></div>
        <div className="article-page__content">
          <p className="article-page__lead">{article.excerpt}</p>
          {article.content.map((paragraph, index) => <section key={paragraph}><h2>{['Начинаем с задачи', 'Запускаем поэтапно', 'Сохраняем прозрачность'][index]}</h2><p>{paragraph}</p></section>)}
        </div>
      </article>
    </main>
  );
}
