import { ArrowRight, Clock3, Globe2, Mail, MessageCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { catalogProducts, portfolioProjects, publications } from '../data/site-data';

export function ContactsPage() {
  const { onOpenContacts } = useOutletContext();
  const [isSent, setIsSent] = useState(false);

  return (
    <main>
      <PageHero title="Работаем удалённо, остаёмся рядом" breadcrumbs={[{ label: 'Контакты' }]} compact />
      <section className="contacts-page">
        <div className="contacts-page__container">
          <div className="contacts-page__cards">
            <article><MessageCircle size={30} strokeWidth={1.7} /><h2>Мессенджеры</h2><p>Telegram, MAX и WhatsApp — выберите удобный канал для быстрого ответа.</p><button type="button" onClick={onOpenContacts}>Выбрать мессенджер <ArrowRight size={18} /></button></article>
            <article><Mail size={30} strokeWidth={1.7} /><h2>Электронная почта</h2><p>Для подробного брифа, документов и материалов по проекту.</p><button type="button" onClick={onOpenContacts}>Написать нам <ArrowRight size={18} /></button></article>
            <article><Clock3 size={30} strokeWidth={1.7} /><h2>Время ответа</h2><p>Обычно отвечаем в течение рабочего дня. Срочные вопросы отмечайте в начале сообщения.</p></article>
            <article><Globe2 size={30} strokeWidth={1.7} /><h2>География</h2><p>Работаем полностью удалённо с клиентами из разных стран и часовых поясов.</p></article>
          </div>
          <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setIsSent(true); }}>
            <span className="section-label">Новая задача</span><h2>Расскажите о проекте</h2><p>Оставьте контакты и коротко опишите, что нужно запустить или улучшить.</p>
            <div className="form-grid"><label><span>Имя</span><input required /></label><label><span>Email</span><input required type="email" /></label></div>
            <label><span>Как с вами связаться?</span><input required placeholder="Telegram, телефон или другой контакт" /></label>
            <label><span>О задаче</span><textarea required rows="6" placeholder="Цель, сроки и важные детали" /></label>
            <label className="form-consent"><input required type="checkbox" /><span>Согласен с <Link to="/privacy">политикой конфиденциальности</Link></span></label>
            <button className="ui-button ui-button--primary" type="submit">{isSent ? 'Заявка отправлена' : 'Отправить заявку'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const normalizedQuery = initialQuery.trim().toLowerCase();
  const results = normalizedQuery ? [
    ...catalogProducts.map((item) => ({ type: 'Каталог', title: item.title, text: item.description, to: `/product/${item.slug}` })),
    ...portfolioProjects.map((item) => ({ type: 'Проект', title: item.title, text: item.description, to: `/projects/${item.slug}` })),
    ...publications.map((item) => ({ type: 'Статья', title: item.title, text: item.excerpt, to: `/news/${item.slug}` })),
  ].filter((item) => `${item.title} ${item.text} ${item.type}`.toLowerCase().includes(normalizedQuery)) : [];

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
  };

  return (
    <main>
      <PageHero title="Результаты поиска" breadcrumbs={[{ label: 'Поиск' }]} compact />
      <section className="search-page">
        <div className="search-page__container">
          <form className="search-page__form" onSubmit={submitSearch}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, Telegram-бот" autoFocus /><button type="submit"><Search size={21} />Найти</button></form>
          <div className="search-page__results">
            {results.map((result) => <article className="search-result" key={`${result.type}-${result.title}`}><span>{result.type}</span><div><h2><Link to={result.to}>{result.title}</Link></h2><p>{result.text}</p></div><Link to={result.to} aria-label={`Открыть «${result.title}»`}><ArrowRight size={21} /></Link></article>)}
            {initialQuery && !results.length && <div className="empty-state"><span className="empty-state__icon"><Search size={38} /></span><h2>Ничего не найдено</h2><p>Попробуйте изменить формулировку или перейдите в каталог.</p><Link className="ui-button ui-button--primary" to="/catalog">Открыть каталог</Link></div>}
          </div>
        </div>
      </section>
    </main>
  );
}

const privacySections = [
  ['1. Общие положения', 'Политика описывает порядок обработки персональных данных пользователей сайта и сервисов Devmarket. Используя формы сайта, пользователь подтверждает ознакомление с настоящими условиями.'],
  ['2. Какие данные обрабатываются', 'Имя, контактные данные, сведения о заказах, сообщения и техническая информация, необходимая для стабильной работы сайта и защиты от злоупотреблений.'],
  ['3. Цели обработки', 'Обработка обращений и заказов, исполнение договоров, поддержка пользователей, улучшение сервиса и выполнение требований законодательства.'],
  ['4. Хранение и защита', 'Данные хранятся не дольше, чем требуется для заявленных целей. Применяются организационные и технические меры защиты от несанкционированного доступа.'],
  ['5. Права пользователя', 'Пользователь может запросить сведения об обработке, уточнение или удаление данных, если их хранение не требуется по закону или действующему договору.'],
  ['6. Обратная связь', 'Запросы по персональным данным принимаются через форму контактов и доступные каналы связи на сайте.'],
  ['7. Файлы cookie', 'Сайт использует обязательные cookie для сохранения пользовательских настроек и стабильной работы интерфейса. Дополнительные cookie применяются только после согласия пользователя, которое можно изменить, очистив сохранённые данные сайта в браузере.'],
];

const offerSections = [
  ['1. Предмет оферты', 'Исполнитель оказывает услуги разработки, настройки, внедрения и поддержки цифровых продуктов, а заказчик принимает и оплачивает согласованный объём работ.'],
  ['2. Оформление заказа', 'Состав, стоимость и сроки фиксируются в заказе, счёте, техническом задании или отдельном приложении. Оплата означает согласие с условиями оферты.'],
  ['3. Порядок оплаты', 'Оплата производится полностью или по этапам в порядке, указанном в заказе. Комиссии платёжных систем могут взиматься отдельно.'],
  ['4. Выполнение и приёмка', 'Результат передаётся электронным способом. Заказчик проверяет его в согласованный срок и направляет мотивированные замечания либо подтверждает приёмку.'],
  ['5. Права на результат', 'Исключительные права и исходные материалы передаются после полной оплаты, если иной порядок не закреплён отдельным соглашением.'],
  ['6. Ответственность', 'Стороны несут ответственность в пределах документально подтверждённого ущерба и учитывают ограничения сторонних сервисов и платформ.'],
  ['7. Статус исполнителя', 'Исполнитель применяет специальный налоговый режим «Налог на профессиональный доход» и после получения оплаты формирует чек в порядке, установленном законодательством. Полные сведения и реквизиты исполнителя указываются в окончательной редакции оферты.'],
  ['8. Заключительные положения', 'Актуальная версия оферты размещается на сайте. Индивидуальные условия заказа имеют приоритет над общими положениями оферты.'],
];

export function PrivacyPage() {
  return <LegalPage title="Политика конфиденциальности" sections={privacySections} />;
}

export function OfferPage() {
  return <LegalPage title="Публичная оферта" sections={offerSections} />;
}

function LegalPage({ title, sections }) {
  return <main><PageHero title={title} breadcrumbs={[{ label: title }]} compact /><article className="legal-page"><div className="legal-page__notice">Черновая редакция. Перед публикацией документ необходимо проверить с юристом и дополнить реквизитами исполнителя.</div>{sections.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}</article></main>;
}

export function NotFoundPage() {
  return <main className="not-found"><div><span>404</span><h1>Страница не найдена</h1><p>Возможно, адрес изменился или страница ещё не создана.</p><div><Link className="ui-button ui-button--primary" to="/">На главную</Link><Link className="ui-button ui-button--outline" to="/catalog">В каталог</Link></div></div></main>;
}
