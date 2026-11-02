import { ArrowUp, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const footerColumns = [
  { title: 'Решения', links: [{ label: 'Боты', to: '/catalog/bots' }, { label: 'Сайты', to: '/catalog/sites' }, { label: 'Разработка под ключ', to: '/catalog/custom' }, { label: 'CRM и интеграции', to: '/catalog/crm' }, { label: 'Мобильные приложения', to: '/catalog/apps' }] },
  { title: 'Компания', links: [{ label: 'Наши проекты', to: '/projects' }, { label: 'Преимущества', to: '/#advantages' }, { label: 'Новости', to: '/news' }, { label: 'Контакты', to: '/contacts' }] },
  { title: 'Информация', links: [{ label: 'Оплата', to: '/payment' }, { label: 'Политика конфиденциальности', to: '/privacy' }, { label: 'Публичная оферта', to: '/offer' }] },
];

export function Footer({ onOpenContacts }) {
  return (
    <footer className="footer" id="contacts">
      <div className="footer__container">
        <div className="footer__main">
          <div className="footer__brand"><Logo /><p className="footer__description">Разрабатываем цифровые продукты, которые помогают бизнесу продавать, автоматизировать процессы и расти.</p><button className="footer__contact" type="button" onClick={onOpenContacts}><MessageCircle size={19} strokeWidth={2} /><span>Связаться с нами</span></button></div>
          <nav className="footer__navigation" aria-label="Навигация в подвале">{footerColumns.map((column) => <div className="footer__column" key={column.title}><h2 className="footer__column-title">{column.title}</h2><div className="footer__links">{column.links.map((link) => <Link className="footer__link" to={link.to} key={link.label}>{link.label}</Link>)}</div></div>)}</nav>
        </div>
        <div className="footer__bottom"><span>© 2026 Devmarket. Все права защищены.</span><span>RU · EN · VI</span><button className="footer__up" type="button" aria-label="Наверх" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={21} strokeWidth={2.2} /></button></div>
      </div>
    </footer>
  );
}
