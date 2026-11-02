import { Gauge, ShieldCheck, Target } from 'lucide-react';
import hotlineServiceImage from '../assets/portfolio/hotline-service.png';
import italikaImage from '../assets/portfolio/italika.png';
import seliboxImage from '../assets/portfolio/selibox.png';

const advantages = [
  {
    icon: Target,
    title: 'Работаем на результат',
    description: 'Проектируем продукт вокруг бизнес-задачи, а не набора случайных функций.',
  },
  {
    icon: Gauge,
    title: 'Запускаем поэтапно',
    description: 'Показываем промежуточный результат и быстрее выводим рабочую версию на рынок.',
  },
  {
    icon: ShieldCheck,
    title: 'Остаёмся после релиза',
    description: 'Поддерживаем, развиваем и следим за стабильностью запущенного продукта.',
  },
];

export function Advantages() {
  return (
    <section className="advantages" id="advantages" aria-labelledby="advantages-title">
      <div className="advantages__container">
        <div className="advantages__content">
          <span className="advantages__eyebrow">Почему мы</span>
          <h2 className="advantages__title" id="advantages-title">Преимущества <span>Devmarket</span></h2>
          <div className="advantages__list">
            {advantages.map((advantage) => {
              const Icon = advantage.icon;

              return (
                <article className="advantages__item" key={advantage.title}>
                  <span className="advantages__item-icon"><Icon size={30} strokeWidth={1.8} /></span>
                  <div>
                    <h3 className="advantages__item-title">{advantage.title}</h3>
                    <p className="advantages__item-text">{advantage.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <div className="advantages__visual" aria-hidden="true">
          <div className="advantages__stat advantages__stat--top">
            <strong>20+</strong>
            <span>реализованных продуктов</span>
          </div>
          <div className="advantages__stat advantages__stat--bottom">
            <strong>5 лет</strong>
            <span>опыта в разработке</span>
          </div>
          <div className="advantages__collage">
            <figure className="advantages__project-shot advantages__project-shot--italika">
              <img src={italikaImage} alt="" />
              <figcaption>Italika</figcaption>
            </figure>
            <figure className="advantages__project-shot advantages__project-shot--hotline">
              <img src={hotlineServiceImage} alt="" />
              <figcaption>Hotline Service</figcaption>
            </figure>
            <figure className="advantages__project-shot advantages__project-shot--selibox">
              <img src={seliboxImage} alt="" />
              <figcaption>SeliBox</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
