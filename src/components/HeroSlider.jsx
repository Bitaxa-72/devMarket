import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import termburgImage from '../assets/hero/termburg-desktop.png';
import hotlineImage from '../assets/portfolio/hotline-service.png';
import seliboxImage from '../assets/portfolio/selibox.png';
import { advanceSlideIndex } from '../utils/slider';

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

const renderedSlides = [
  { key: 'clone-last', originalIndex: slides.length - 1, slide: slides[slides.length - 1], clone: true },
  ...slides.map((slide, originalIndex) => ({ key: slide.id, originalIndex, slide, clone: false })),
  { key: 'clone-first', originalIndex: 0, slide: slides[0], clone: true },
];

export function HeroSlider({ onOpenContacts }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const animationLock = useRef(false);
  const transitionFrame = useRef(null);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || reduceMotion || isAnimating) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      changeSlide(1);
    }, AUTOPLAY_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isAnimating, isPaused, reduceMotion, resetCount]);

  useEffect(() => () => {
    if (transitionFrame.current !== null) {
      window.cancelAnimationFrame(transitionFrame.current);
    }
  }, []);

  useEffect(() => {
    if (!isAnimating) return undefined;

    const timer = window.setTimeout(() => finishTransition(), reduceMotion ? 0 : 560);
    return () => window.clearTimeout(timer);
  }, [isAnimating, reduceMotion, trackIndex]);

  const finishTransition = () => {
    let normalizedIndex = trackIndex;

    if (trackIndex === 0) normalizedIndex = slides.length;
    if (trackIndex === slides.length + 1) normalizedIndex = 1;

    if (normalizedIndex !== trackIndex) {
      setTransitionEnabled(false);
      setTrackIndex(normalizedIndex);
      transitionFrame.current = window.requestAnimationFrame(() => {
        transitionFrame.current = window.requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }

    animationLock.current = false;
    setIsAnimating(false);
  };

  const changeSlide = (direction) => {
    if (animationLock.current) return;

    animationLock.current = true;
    setIsAnimating(true);
    setTransitionEnabled(!reduceMotion);
    setTrackIndex((currentIndex) => currentIndex + direction);
    setActiveIndex((currentIndex) => advanceSlideIndex(currentIndex, direction, slides.length));
    setResetCount((count) => count + 1);
  };

  const selectSlide = (index) => {
    if (animationLock.current || index === activeIndex) return;

    animationLock.current = true;
    setIsAnimating(true);
    setTransitionEnabled(!reduceMotion);
    setTrackIndex(index + 1);
    setActiveIndex(index);
    setResetCount((count) => count + 1);
  };

  const handleTrackTransitionEnd = (event) => {
    if (event.target === event.currentTarget && event.propertyName === 'transform') {
      finishTransition();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeSlide(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(1);
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
            <path d="M .2 0 H 1 V 1 H .2 C .18 1 .165 .985 .155 .96 L .02 .59 C .01 .5626 0 .53 0 .5 C 0 .47 .01 .4374 .02 .41 L .155 .04 C .165 .015 .18 0 .2 0 Z" />
          </clipPath>
        </defs>
      </svg>
      <span className="hero-slider__status" aria-live="polite">Слайд {activeIndex + 1} из {slides.length}: {activeSlide.title}</span>
      <div className="hero-slider__viewport">
        <div
          className={`hero-slider__track${transitionEnabled ? '' : ' hero-slider__track--static'}`}
          style={{ '--hero-track-index': trackIndex }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {renderedSlides.map(({ clone, key, originalIndex, slide }) => {
            const isActive = !clone && originalIndex === activeIndex;

            return (
              <article className={`hero-slider__slide${isActive ? ' hero-slider__slide--active' : ''}`} aria-hidden={clone || !isActive} key={key}>
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
        <button className="hero-slider__arrow" type="button" aria-label="Предыдущий слайд" onClick={() => changeSlide(-1)}>
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
        <button className="hero-slider__arrow" type="button" aria-label="Следующий слайд" onClick={() => changeSlide(1)}>
          <ChevronRight size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
