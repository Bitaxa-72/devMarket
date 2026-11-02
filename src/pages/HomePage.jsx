import { Link, useOutletContext } from 'react-router-dom';
import { Advantages } from '../components/Advantages';
import { Catalog } from '../components/Catalog';
import { Faq } from '../components/Faq';
import { News } from '../components/News';
import { Projects } from '../components/Projects';
import termburgDesktop from '../assets/hero/termburg-desktop.png';

export function HomePage() {
  const { addToCart, onOpenContacts } = useOutletContext();

  return (
    <main>
      <section className="hero" aria-label="Основное предложение">
        <div className="hero__container">
          <div className="hero__content">
            <span className="hero__eyebrow">Цифровые продукты под задачу</span>
            <h1 className="hero__title">Запускаем сервисы, которые работают на ваш бизнес</h1>
            <p className="hero__text">Выберите готовый проект или закажите разработку с нуля: от лендинга до Telegram-бота с платным контентом.</p>
            <div className="hero__actions">
              <a className="hero__button hero__button--primary" href="#catalog">Выбрать проект</a>
              <button className="hero__button hero__button--secondary" type="button" onClick={onOpenContacts}>Обсудить задачу</button>
            </div>
            <div className="hero__points">
              <span className="hero__point">Готовые решения</span>
              <span className="hero__point">Разработка под ключ</span>
              <span className="hero__point">Поддержка после запуска</span>
            </div>
          </div>
          <div className="hero__visual">
            <img className="hero__project-image" src={termburgDesktop} alt="Termburg website" />
            <article className="hero__case">
              <span className="hero__case-eyebrow">Реализованный проект</span>
              <strong className="hero__case-title">Термбург</strong>
              <span className="hero__case-description">Сайт термального комплекса</span>
              <span className="hero__case-tags">
                <span className="hero__case-tag">Сайт</span>
                <span className="hero__case-tag">Дизайн</span>
                <span className="hero__case-tag">Разработка</span>
              </span>
              <Link className="hero__case-action" to="/projects" aria-label="View our projects">Смотреть наши работы <span aria-hidden="true">↗</span></Link>
            </article>
          </div>
        </div>
      </section>
      <Catalog onAddToCart={addToCart} />
      <Projects onOpenContacts={onOpenContacts} />
      <Advantages />
      <News />
      <Faq onOpenContacts={onOpenContacts} />
    </main>
  );
}
