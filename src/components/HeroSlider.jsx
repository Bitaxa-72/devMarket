import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import termburgImage from '../assets/hero/termburg-desktop.png';
import hotlineImage from '../assets/portfolio/hotline-service.png';
import seliboxImage from '../assets/portfolio/selibox.png';
import { normalizeLoopTrackIndex, wrapSlideIndex } from '../utils/slider';

const AUTOPLAY_DELAY = 7000;

const slides = [
  {
    id: 'ready-solutions',
    title: 'Готовые решения',
    description: 'Выберите проверенное решение и адаптируйте интерфейс, функции и интеграции под задачи вашего бизнеса.',
    image: seliboxImage,
    imageAlt: 'Интерфейс сервиса SeliBox с каталогом готовых наборов',
    actionLabel: 'Выбрать решение',
    actionTo: '/catalog',
    paginationLabel: 'Готовые решения',
  },
  {
    id: 'custom-development',
    title: 'Разработка под ключ',
    description: 'Проектируем путь клиента, собираем интерфейс и связываем продукт с нужными системами — от первой схемы до запуска.',
    image: hotlineImage,
    imageAlt: 'Главная страница проекта Hotline Service',
    actionLabel: 'Обсудить задачу',
    action: 'contact',
    paginationLabel: 'Разработка под ключ',
  },
  {
    id: 'business-websites',
    title: 'Сайты для бизнеса',
    description: 'Соединяем понятную структуру, выразительную подачу и удобный сценарий обращения в цельный цифровой продукт.',
    image: termburgImage,
    imageAlt: 'Главная страница сайта термального комплекса Термбург',
    actionLabel: 'Смотреть проекты',
    actionTo: '/projects',
    paginationLabel: 'Сайты для бизнеса',
  },
];

export function HeroSlider({ onOpenContacts }) {
  const loopedSlides = useMemo(() => [slides[slides.length - 1], ...slides, slides[0]], []);
  const [trackIndex, setTrackIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeIndex = wrapSlideIndex(trackIndex - 1, slides.length);
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
      setTrackIndex((currentIndex) => currentIndex + 1);
    }, AUTOPLAY_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, reduceMotion, resetCount]);

  const changeSlide = (nextTrackIndex) => {
    if (nextTrackIndex < 0 || nextTrackIndex > slides.length + 1) {
      return;
    }

    setIsTransitionEnabled(true);
    setTrackIndex(nextTrackIndex);
    setResetCount((count) => count + 1);
  };

  const selectSlide = (index) => {
    changeSlide(index + 1);
  };

  const handleTransitionEnd = () => {
    if (trackIndex !== 0 && trackIndex !== slides.length + 1) {
      return;
    }

    setIsTransitionEnabled(false);
    setTrackIndex(normalizeLoopTrackIndex(trackIndex, slides.length));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsTransitionEnabled(true));
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeSlide(trackIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(trackIndex + 1);
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
      <svg className="hero-slider__clip-definitions" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="hero-slider-frame-clip" clipPathUnits="objectBoundingBox">
            <path d="M .18 0 H 1 V 1 H .18 C .16 1 .15 .98 .15 .95 C .12 .84 0 .64 0 .52 C 0 .48 .12 .16 .15 .05 C .15 .02 .16 0 .18 0 Z" />
          </clipPath>
        </defs>
      </svg>
      <span className="hero-slider__status" aria-live="polite">Слайд {activeIndex + 1} из {slides.length}: {activeSlide.title}</span>
      <div className="hero-slider__viewport">
        <div
          className={`hero-slider__track${isTransitionEnabled && !reduceMotion ? ' hero-slider__track--animated' : ''}`}
          style={{ transform: `translate3d(-${trackIndex * 100}%, 0, 0)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {loopedSlides.map((slide, index) => {
            const slideIndex = wrapSlideIndex(index - 1, slides.length);
            const isActive = slideIndex === activeIndex && index === trackIndex;

            return (
              <article className="hero-slider__slide" aria-hidden={!isActive} key={`${slide.id}-${index}`}>
                <div className="hero-slider__container">
                  <div className="hero-slider__content">
                    <h1 className="hero-slider__title">{slide.title}</h1>
                    <p className="hero-slider__description">{slide.description}</p>
                    <div className="hero-slider__actions">
                      {slide.action === 'contact' ? (
                        <button className="hero-slider__button" type="button" tabIndex={isActive ? 0 : -1} onClick={onOpenContacts}>{slide.actionLabel}</button>
                      ) : (
                        <Link className="hero-slider__button" to={slide.actionTo} tabIndex={isActive ? 0 : -1}>{slide.actionLabel}</Link>
                      )}
                    </div>
                  </div>
                  <div className="hero-slider__visual">
                    <figure className="hero-slider__frame">
                      <img className="hero-slider__image" src={slide.image} alt={slide.imageAlt} />
                    </figure>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="hero-slider__navigation">
        <button className="hero-slider__arrow" type="button" aria-label="Предыдущий слайд" onClick={() => changeSlide(trackIndex - 1)}>
          <ChevronLeft size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <div className="hero-slider__pagination" aria-label="Выбор слайда">
          {slides.map((slide, index) => (
            <button
              className={`hero-slider__pagination-button${index === activeIndex ? ' hero-slider__pagination-button--active' : ''}`}
              type="button"
              aria-current={index === activeIndex ? 'true' : undefined}
              aria-label={`Показать слайд ${index + 1}: ${slide.paginationLabel}`}
              key={slide.id}
              onClick={() => selectSlide(index)}
            >
              <span className="hero-slider__pagination-dot" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button className="hero-slider__arrow" type="button" aria-label="Следующий слайд" onClick={() => changeSlide(trackIndex + 1)}>
          <ChevronRight size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
