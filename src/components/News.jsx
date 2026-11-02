import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { newsItems } from '../data/news';
import { newsImageList } from '../data/news-media';
import { NewsCard } from './NewsCard';

export function News() {
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

  const scrollNews = (direction) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const card = track.querySelector('.news__card');
    const distance = card ? card.getBoundingClientRect().width + 28 : 380;
    track.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  return (
    <section className="news" id="news" aria-labelledby="news-title">
      <div className="news__container">
        <div className="news__header">
          <div>
            <span className="news__eyebrow">Полезное</span>
            <h2 className="news__title" id="news-title">Новости и статьи</h2>
          </div>
          <div className="news__controls" aria-label="Навигация по новостям">
            <button className="news__control" type="button" aria-label="Предыдущие новости" disabled={!canScrollBack} onClick={() => scrollNews(-1)}><ArrowLeft size={30} strokeWidth={2.1} /></button>
            <button className="news__control" type="button" aria-label="Следующие новости" disabled={!canScrollForward} onClick={() => scrollNews(1)}><ArrowRight size={30} strokeWidth={2.1} /></button>
          </div>
        </div>
        <div className="news__track" ref={trackRef} onScroll={updateControls}>
          {newsItems.map((item, index) => <NewsCard article={item} image={newsImageList[index]} to={`/news/article-${index + 1}`} key={item.title} />)}
        </div>
      </div>
    </section>
  );
}
