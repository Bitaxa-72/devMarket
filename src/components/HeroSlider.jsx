import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import termburgImage from '../assets/hero/termburg-desktop.png';
import hotlineImage from '../assets/portfolio/hotline-service.png';
import seliboxImage from '../assets/portfolio/selibox.png';
import { wrapSlideIndex } from '../utils/slider';

const AUTOPLAY_DELAY = 7000;

const slides = [
  {
    id: 'ready-solutions',
    title: 'Запускайте новый продукт на готовой основе',
    description: 'Выберите проверенный сценарий и адаптируйте интерфейс, функции и интеграции под задачи вашего бизнеса.',
    image: seliboxImage,
    imageAlt: 'Интерфейс сервиса SeliBox с каталогом готовых наборов',
    primaryLabel: 'Выбрать решение',
    primaryTo: '/catalog',
    secondaryLabel: 'Смотреть проекты',
    secondaryTo: '/projects',
    paginationLabel: 'Готовые решения',
  },
  {
    id: 'custom-development',
    title: 'Создаём сервисы под реальные процессы компании',
    description: 'Проектируем путь клиента, собираем интерфейс и связываем продукт с нужными системами — от первой схемы до запуска.',
    image: hotlineImage,
    imageAlt: 'Главная страница проекта Hotline Service',
    primaryLabel: 'Обсудить задачу',
    primaryAction: 'contact',
    secondaryLabel: 'Наши работы',
    secondaryTo: '/projects',
    paginationLabel: 'Под ключ',
  },
  {
    id: 'business-websites',
    title: 'Показываем продукт так, чтобы им хотелось воспользоваться',
    description: 'Соединяем понятную структуру, выразительную подачу и удобный сценарий обращения в цельный цифровой продукт.',
    image: termburgImage,
    imageAlt: 'Главная страница сайта термального комплекса Термбург',
    primaryLabel: 'Смотреть проекты',
    primaryTo: '/projects',
    secondaryLabel: 'Обсудить запуск',
    secondaryAction: 'contact',
    paginationLabel: 'Сайты',
  },
];

export function HeroSlider({ onOpenContacts }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || reduceMotion) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((currentIndex) => wrapSlideIndex(currentIndex + 1, slides.length));
    }, AUTOPLAY_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, reduceMotion, resetCount]);

  const changeSlide = (nextIndex) => {
    setActiveIndex(wrapSlideIndex(nextIndex, slides.length));
    setResetCount((count) => count + 1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeSlide(activeIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(activeIndex + 1);
    }
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false);
    }
  };

  return (
    <section
      className="hero-slider"
      aria-label="Основное предложение"
      aria-roledescription="карусель"
      onBlur={handleBlur}
      onFocusCapture={() => setIsPaused(true)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span className="hero-slider__status" aria-live="polite">Слайд {activeIndex + 1} из {slides.length}: {activeSlide.title}</span>
      <div className="hero-slider__container">
        <div className="hero-slider__content" key={`content-${activeSlide.id}`}>
          <h1 className="hero-slider__title">{activeSlide.title}</h1>
          <p className="hero-slider__description">{activeSlide.description}</p>
          <div className="hero-slider__actions">
            {activeSlide.primaryAction === 'contact' ? (
              <button className="hero-slider__button hero-slider__button--primary" type="button" onClick={onOpenContacts}>{activeSlide.primaryLabel}</button>
            ) : (
              <Link className="hero-slider__button hero-slider__button--primary" to={activeSlide.primaryTo}>{activeSlide.primaryLabel}</Link>
            )}
            {activeSlide.secondaryAction === 'contact' ? (
              <button className="hero-slider__button hero-slider__button--secondary" type="button" onClick={onOpenContacts}>{activeSlide.secondaryLabel}</button>
            ) : (
              <Link className="hero-slider__button hero-slider__button--secondary" to={activeSlide.secondaryTo}>{activeSlide.secondaryLabel}</Link>
            )}
          </div>
          <div className="hero-slider__controls">
            <button className="hero-slider__arrow" type="button" aria-label="Предыдущий слайд" onClick={() => changeSlide(activeIndex - 1)}>
              <ChevronLeft size={25} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <div className="hero-slider__pagination" aria-label="Выбор слайда">
              {slides.map((slide, index) => (
                <button
                  className={`hero-slider__pagination-button${index === activeIndex ? ' hero-slider__pagination-button--active' : ''}`}
                  type="button"
                  aria-current={index === activeIndex ? 'true' : undefined}
                  aria-label={`Показать слайд ${index + 1}: ${slide.paginationLabel}`}
                  key={slide.id}
                  onClick={() => changeSlide(index)}
                >
                  <span className="hero-slider__pagination-dot" aria-hidden="true" />
                </button>
              ))}
            </div>
            <button className="hero-slider__arrow" type="button" aria-label="Следующий слайд" onClick={() => changeSlide(activeIndex + 1)}>
              <ChevronRight size={25} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="hero-slider__visual" key={`visual-${activeSlide.id}`}>
          <figure className="hero-slider__frame">
            <img className="hero-slider__image" src={activeSlide.image} alt={activeSlide.imageAlt} />
          </figure>
        </div>
      </div>
    </section>
  );
}
