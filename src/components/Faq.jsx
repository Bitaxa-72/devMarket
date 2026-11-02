import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { faqItems } from '../data/faq';

export function Faq({ onOpenContacts }) {
  const [activeItem, setActiveItem] = useState(0);

  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="faq__container">
        <div className="faq__intro">
          <span className="faq__eyebrow">FAQ</span>
          <h2 className="faq__title" id="faq-title">Частые вопросы</h2>
          <p className="faq__text">Не нашли нужный ответ? Опишите задачу — разберём её и предложим подходящий формат работы.</p>
          <button className="faq__contact" type="button" onClick={onOpenContacts}>Задать свой вопрос</button>
        </div>
        <div className="faq__list">
          {faqItems.map((item, index) => {
            const isActive = activeItem === index;
            const panelId = `faq-panel-${index}`;

            return (
              <article className={`faq__item ${isActive ? 'faq__item--active' : ''}`} key={item.question}>
                <h3 className="faq__question">
                  <button className="faq__button" type="button" aria-expanded={isActive} aria-controls={panelId} onClick={() => setActiveItem(isActive ? -1 : index)}>
                    <span>{item.question}</span>
                    <span className="faq__button-icon" aria-hidden="true">{isActive ? <Minus size={20} /> : <Plus size={20} />}</span>
                  </button>
                </h3>
                <div className="faq__answer" id={panelId}>
                  <div className="faq__answer-inner"><p>{item.answer}</p></div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
