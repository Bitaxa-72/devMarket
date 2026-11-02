import { Check, Download, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AccountShell } from '../components/AccountShell';
import { PaymentWorkspace } from '../components/PaymentWorkspace';
import { accountOrders, getAccountOrder, orderStatuses } from '../data/account-data';

export function LoginPage() {
  const [mode, setMode] = useState('login');

  return (
    <main className="auth-page">
      <div className="auth-page__visual"><span className="auth-page__badge">D</span><h1>Управляйте проектами в одном месте</h1><p>Заказы, документы, статусы работ и общение с командой.</p><div><span><Check size={17} />История заказов</span><span><Check size={17} />Документы и оплаты</span><span><Check size={17} />Прямой чат</span></div></div>
      <div className="auth-page__form-wrap"><div className="auth-page__form"><span>Личный кабинет</span><h2>{mode === 'login' ? 'Вход' : 'Восстановление доступа'}</h2><p>{mode === 'login' ? 'Введите данные, указанные при оформлении заказа.' : 'Отправим ссылку для смены пароля на вашу почту.'}</p><form><label><span>Email</span><input type="email" required autoComplete="email" /></label>{mode === 'login' && <label><span>Пароль</span><input type="password" required autoComplete="current-password" /></label>}<Link className="ui-button ui-button--primary" to="/account">{mode === 'login' ? 'Войти' : 'Отправить ссылку'}</Link></form><button className="auth-page__switch" type="button" onClick={() => setMode(mode === 'login' ? 'reset' : 'login')}>{mode === 'login' ? 'Забыли пароль?' : 'Вернуться ко входу'}</button></div></div>
    </main>
  );
}

export function AccountPage() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = ['profile', 'security', 'chat'].includes(requestedTab) ? requestedTab : 'orders';
  const [messages, setMessages] = useState([{ id: 1, author: 'manager', text: 'Здравствуйте! Здесь можно задать вопрос по заказу или новой задаче.', time: '10:30' }]);
  const [message, setMessage] = useState('');

  const sendMessage = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessages((items) => [...items, { id: Date.now(), author: 'user', text, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
  };

  return <AccountShell activeTab={activeTab}>{activeTab === 'orders' && <OrdersPanel />}{activeTab === 'profile' && <ProfilePanel />}{activeTab === 'security' && <SecurityPanel />}{activeTab === 'chat' && <ChatPanel messages={messages} message={message} setMessage={setMessage} sendMessage={sendMessage} />}</AccountShell>;
}

function OrdersPanel() {
  const [activeStatuses, setActiveStatuses] = useState([]);
  const visibleOrders = activeStatuses.length ? accountOrders.filter((order) => activeStatuses.includes(order.status)) : accountOrders;
  const toggleStatus = (status) => setActiveStatuses((items) => items.includes(status) ? items.filter((item) => item !== status) : [...items, status]);

  return <div className="account-panel"><div className="account-panel__heading"><div><span>Заказы</span><h2>Мои проекты</h2></div><Link className="ui-button ui-button--primary" to="/catalog">Новый заказ</Link></div><div className="order-filters">{orderStatuses.map((status) => <button className={activeStatuses.includes(status.id) ? 'order-filters__button order-filters__button--active' : 'order-filters__button'} type="button" aria-pressed={activeStatuses.includes(status.id)} key={status.id} onClick={() => toggleStatus(status.id)}>{status.label}</button>)}</div>{visibleOrders.map((order) => <article className="order-row" key={order.id}><span className="order-row__number">#{order.id}</span><div><h3>{order.title}</h3><p>Создан {order.createdAt}</p></div><span className={`order-row__status order-row__status--${order.status}`}>{orderStatuses.find((status) => status.id === order.status).label}</span><strong>{order.price}</strong><Link className="order-row__details" to={`/account/orders/${order.id}`}>Подробнее</Link></article>)}</div>;
}

export function AccountOrderPage() {
  const { orderId } = useParams();
  const order = getAccountOrder(orderId);

  if (!order) return <AccountShell activeTab="orders" title="Заказ не найден" breadcrumbs={[{ label: 'Заказ' }]}><div className="account-panel account-panel--empty"><h2>Такого заказа нет</h2><p>Вернитесь к списку проектов и выберите доступный заказ.</p><Link className="ui-button ui-button--primary" to="/account">Вернуться к заказам</Link></div></AccountShell>;

  const status = orderStatuses.find((item) => item.id === order.status);
  return <AccountShell activeTab="orders" title={order.title} breadcrumbs={[{ label: `#${order.id}` }]}><div className="account-order"><div className="account-order__overview"><div><span>Заказ #{order.id}</span><h2>{order.title}</h2><p>{order.summary}</p></div><dl className="account-order__facts"><div><dt>Статус проекта</dt><dd className={`order-row__status order-row__status--${order.status}`}>{status.label}</dd></div><div><dt>Оплата</dt><dd className={`account-order__payment-status account-order__payment-status--${order.paymentTone}`}>{order.paymentStatus}</dd></div><div><dt>Стоимость</dt><dd>{order.price}</dd></div><div><dt>Создан</dt><dd>{order.createdAt}</dd></div></dl></div><section className="account-order__section account-order__specification"><div className="account-order__section-heading"><FileText size={22} /><div><span>Документация</span><h2>Техническое задание</h2></div></div><ul>{order.specification.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></section><section className="account-order__section"><div className="account-order__section-heading"><Download size={22} /><div><span>Материалы</span><h2>Вложения</h2></div></div><div className="account-order__attachments">{order.attachments.map((attachment) => <a className="account-order__attachment" href={`/files/${encodeURIComponent(attachment)}`} download key={attachment}><FileText size={19} /><span>{attachment}</span><Download size={17} /></a>)}</div></section></div></AccountShell>;
}

export function AccountPaymentPage() {
  return <AccountShell activeTab="payment" title="Оплата и баланс" breadcrumbs={[{ label: 'Оплата' }]}><PaymentWorkspace embedded /></AccountShell>;
}

function ProfilePanel() {
  return <div className="account-panel"><div className="account-panel__heading"><div><span>Профиль</span><h2>Личные данные</h2></div></div><form className="account-form"><div className="form-grid"><label><span>Имя</span><input name="firstName" defaultValue="Алексей" /></label><label><span>Фамилия</span><input name="lastName" defaultValue="Иванов" /></label><label><span>Email</span><input name="email" type="email" defaultValue="alexey@example.com" /></label><label><span>Телефон</span><input name="phone" defaultValue="+7 900 000-00-00" /></label><label><span>Telegram</span><input name="telegram" defaultValue="@alexey" /></label><label><span>MAX</span><input name="max" placeholder="Имя пользователя или телефон" /></label><label><span>WhatsApp</span><input name="whatsapp" defaultValue="+7 900 000-00-00" /></label></div><button className="ui-button ui-button--primary" type="button">Сохранить изменения</button></form></div>;
}

function SecurityPanel() {
  return <div className="account-panel"><div className="account-panel__heading"><div><span>Безопасность</span><h2>Смена пароля</h2></div></div><form className="account-form account-form--narrow"><label><span>Текущий пароль</span><input type="password" /></label><label><span>Новый пароль</span><input type="password" /></label><label><span>Повторите новый пароль</span><input type="password" /></label><button className="ui-button ui-button--primary" type="button">Обновить пароль</button></form></div>;
}

function ChatPanel({ messages, message, setMessage, sendMessage }) {
  return <div className="account-panel account-panel--chat"><div className="account-panel__heading"><div><span>Поддержка</span><h2>Чат с менеджером</h2></div><span className="account-panel__online">Онлайн</span></div><div className="account-chat">{messages.map((item) => <div className={`account-chat__message account-chat__message--${item.author}`} key={item.id}><p>{item.text}</p><span>{item.time}</span></div>)}</div><form className="account-chat__form" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Напишите сообщение" /><button type="submit" aria-label="Отправить"><Send size={20} /></button></form></div>;
}
