import { Check, LockKeyhole, MessageCircle, PackageCheck, Send, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';

const accountTabs = [
  { id: 'orders', label: 'Заказы', icon: PackageCheck },
  { id: 'profile', label: 'Личные данные', icon: UserRound },
  { id: 'security', label: 'Безопасность', icon: LockKeyhole },
  { id: 'chat', label: 'Чат', icon: MessageCircle },
];

export function LoginPage() {
  const [mode, setMode] = useState('login');

  return (
    <main className="auth-page">
      <div className="auth-page__visual"><span className="auth-page__badge">D</span><h1>Управляйте проектами в одном месте</h1><p>Заказы, документы, статусы работ и общение с командой.</p><div><span><Check size={17} />История заказов</span><span><Check size={17} />Документы и оплаты</span><span><Check size={17} />Прямой чат</span></div></div>
      <div className="auth-page__form-wrap">
        <div className="auth-page__form">
          <span>Личный кабинет</span><h2>{mode === 'login' ? 'Вход' : 'Восстановление доступа'}</h2><p>{mode === 'login' ? 'Введите данные, указанные при оформлении заказа.' : 'Отправим ссылку для смены пароля на вашу почту.'}</p>
          <form>
            <label><span>Email</span><input type="email" required autoComplete="email" /></label>
            {mode === 'login' && <label><span>Пароль</span><input type="password" required autoComplete="current-password" /></label>}
            <Link className="ui-button ui-button--primary" to="/account">{mode === 'login' ? 'Войти' : 'Отправить ссылку'}</Link>
          </form>
          <button className="auth-page__switch" type="button" onClick={() => setMode(mode === 'login' ? 'reset' : 'login')}>{mode === 'login' ? 'Забыли пароль?' : 'Вернуться ко входу'}</button>
        </div>
      </div>
    </main>
  );
}

export function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [messages, setMessages] = useState([{ id: 1, author: 'manager', text: 'Здравствуйте! Здесь можно задать вопрос по заказу или новой задаче.', time: '10:30' }]);
  const [message, setMessage] = useState('');

  const sendMessage = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessages((items) => [...items, { id: Date.now(), author: 'user', text, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
  };

  return (
    <main>
      <PageHero title="Здравствуйте, Алексей" breadcrumbs={[{ label: 'Личный кабинет' }]} compact />
      <section className="account-page">
        <div className="account-page__container">
          <aside className="account-page__sidebar">
            {accountTabs.map((tab) => {
              const Icon = tab.icon;
              return <button className={activeTab === tab.id ? 'account-page__tab account-page__tab--active' : 'account-page__tab'} type="button" key={tab.id} onClick={() => setActiveTab(tab.id)}><Icon size={19} />{tab.label}</button>;
            })}
            <Link to="/login">Выйти</Link>
          </aside>
          <div className="account-page__content">
            {activeTab === 'orders' && <OrdersPanel />}
            {activeTab === 'profile' && <ProfilePanel />}
            {activeTab === 'security' && <SecurityPanel />}
            {activeTab === 'chat' && <ChatPanel messages={messages} message={message} setMessage={setMessage} sendMessage={sendMessage} />}
          </div>
        </div>
      </section>
    </main>
  );
}

function OrdersPanel() {
  return <div className="account-panel"><div className="account-panel__heading"><div><span>Заказы</span><h2>Мои проекты</h2></div><Link className="ui-button ui-button--primary" to="/catalog">Новый заказ</Link></div><article className="order-row"><span className="order-row__number">#DM-1042</span><div><h3>Telegram-бот с платным контентом</h3><p>Создан 24 сентября 2026</p></div><span className="order-row__status">В работе</span><strong>49 000 ₽</strong><button type="button">Подробнее</button></article><article className="order-row"><span className="order-row__number">#DM-0971</span><div><h3>Аудит сайта и аналитики</h3><p>Создан 12 августа 2026</p></div><span className="order-row__status order-row__status--done">Завершён</span><strong>25 000 ₽</strong><button type="button">Подробнее</button></article></div>;
}

function ProfilePanel() {
  return <div className="account-panel"><div className="account-panel__heading"><div><span>Профиль</span><h2>Личные данные</h2></div></div><form className="account-form"><div className="form-grid"><label><span>Имя</span><input defaultValue="Алексей" /></label><label><span>Фамилия</span><input defaultValue="Иванов" /></label><label><span>Email</span><input type="email" defaultValue="alexey@example.com" /></label><label><span>Телефон</span><input defaultValue="+7 900 000-00-00" /></label></div><button className="ui-button ui-button--primary" type="button">Сохранить изменения</button></form></div>;
}

function SecurityPanel() {
  return <div className="account-panel"><div className="account-panel__heading"><div><span>Безопасность</span><h2>Смена пароля</h2></div></div><form className="account-form account-form--narrow"><label><span>Текущий пароль</span><input type="password" /></label><label><span>Новый пароль</span><input type="password" /></label><label><span>Повторите новый пароль</span><input type="password" /></label><button className="ui-button ui-button--primary" type="button">Обновить пароль</button></form></div>;
}

function ChatPanel({ messages, message, setMessage, sendMessage }) {
  return <div className="account-panel account-panel--chat"><div className="account-panel__heading"><div><span>Поддержка</span><h2>Чат с менеджером</h2></div><span className="account-panel__online">Онлайн</span></div><div className="account-chat">{messages.map((item) => <div className={`account-chat__message account-chat__message--${item.author}`} key={item.id}><p>{item.text}</p><span>{item.time}</span></div>)}</div><form className="account-chat__form" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Напишите сообщение" /><button type="submit" aria-label="Отправить"><Send size={20} /></button></form></div>;
}
