import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ProductGallery({ images, title }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => setActiveSlide(0), [title]);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const autoplayTimer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % images.length), 6000);
    return () => window.clearInterval(autoplayTimer);
  }, [images.length, title]);

  const showPrevious = () => setActiveSlide((slide) => (slide - 1 + images.length) % images.length);
  const showNext = () => setActiveSlide((slide) => (slide + 1) % images.length);

  return (
    <div className="product-gallery" data-autoplay-interval="6000">
      <div className="product-gallery__stage">
        <img className="product-gallery__image" src={images[activeSlide]} alt={`${title} — пример экрана ${activeSlide + 1}`} />
        {images.length > 1 && (
          <>
            <button className="product-gallery__control product-gallery__control--previous" type="button" aria-label="Предыдущий экран" onClick={showPrevious}><ChevronLeft size={22} /></button>
            <button className="product-gallery__control product-gallery__control--next" type="button" aria-label="Следующий экран" onClick={showNext}><ChevronRight size={22} /></button>
          </>
        )}
        <span className="product-gallery__counter">{activeSlide + 1} / {images.length}</span>
      </div>
      <div className="product-gallery__caption"><span>Пример реализованного интерфейса</span><strong>{title}</strong></div>
    </div>
  );
}
