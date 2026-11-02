import { X } from 'lucide-react';
import { contactChannels } from '../data/contact-channels';

export function ContactModal({ isOpen, onClose, subject = '' }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="contact-modal" role="presentation" onMouseDown={onClose}>
      <section className="contact-modal__content" role="dialog" aria-modal="true" aria-label="Способы связи" onMouseDown={(event) => event.stopPropagation()}>
        <button className="contact-modal__close" type="button" aria-label="Закрыть" onClick={onClose}>
          <X size={22} strokeWidth={2} />
        </button>
        <span className="contact-modal__eyebrow">На связи</span>
        <h2 className="contact-modal__title">Выберите удобный способ</h2>
        {subject && <span className="contact-modal__subject">Вы выбрали: {subject}</span>}
        <p className="contact-modal__text">{subject ? 'Уже знаем, что вы хотите обсудить. Останется уточнить детали задачи.' : 'Ответим на вопрос, поможем выбрать решение или обсудим задачу.'}</p>
        <div className="contact-modal__list">
          {contactChannels.map((channel) => (
            <a className={`contact-modal__item ${channel.url ? '' : 'contact-modal__item--inactive'}`} href={channel.url || undefined} key={channel.title} target={channel.url ? '_blank' : undefined} rel={channel.url ? 'noreferrer' : undefined} aria-disabled={!channel.url} tabIndex={channel.url ? 0 : -1}>
              <span className="contact-modal__item-icon"><span className="contact-modal__item-logo" aria-hidden="true" style={{ '--contact-icon': `url("${channel.icon}")`, '--contact-color': channel.color }} /></span>
              <span className="contact-modal__item-content">
                <span className="contact-modal__item-title">{channel.title}</span>
                <span className="contact-modal__item-description">{channel.description}</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
