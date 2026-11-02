import { CreditCard, FileText, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentMethods } from '../data/site-data';

const formatPrice = (value) => new Intl.NumberFormat('ru-RU').format(value);

export function PaymentWorkspace({ embedded = false }) {
  const [amount, setAmount] = useState('5000');

  return (
    <div className={embedded ? 'payment-page__container payment-page__container--embedded' : 'payment-page__container'}>
      <div className="payment-page__content">
        <span className="section-label">Способы оплаты</span><h2>Выберите удобный вариант</h2>
        <div className="payment-page__methods">
          {paymentMethods.map((method, index) => {
            const icons = [CreditCard, WalletCards, ReceiptText];
            const Icon = icons[index];
            return <article key={method.title}><Icon size={28} strokeWidth={1.7} /><div><h3>{method.title}</h3><p>{method.description}</p></div></article>;
          })}
        </div>
        <div className="payment-page__documents"><h2>Документы</h2><p>Для юридических лиц доступны счёт, акт и договор. Документы формируются в личном кабинете и отправляются на указанную почту.</p><div><Link to="/offer"><FileText size={18} />Публичная оферта</Link><Link to="/privacy"><ShieldCheck size={18} />Политика конфиденциальности</Link></div></div>
      </div>
      <aside className="balance-card">
        <form className="balance-card__form" onSubmit={(event) => event.preventDefault()}>
          <span>Баланс сервиса</span><h2>Пополнить счёт</h2><p>Средства можно использовать для оплаты заказов и поддержки.</p>
          <label><span>Сумма пополнения</span><span className="balance-card__input"><input type="number" min="1000" step="1000" value={amount} required onChange={(event) => setAmount(event.target.value)} /><i>₽</i></span></label>
          <div className="balance-card__amounts">{['5000', '15000', '30000'].map((value) => <button type="button" key={value} onClick={() => setAmount(value)}>{formatPrice(Number(value))} ₽</button>)}</div>
          <label><span>Почта для чека</span><span className="balance-card__input balance-card__input--email"><input type="email" name="receiptEmail" autoComplete="email" placeholder="name@example.ru" required /></span></label>
          <button className="ui-button ui-button--primary" type="submit">Перейти к оплате</button><small>Безопасная оплата через ЮKassa. Чек придёт на указанную почту.</small>
        </form>
      </aside>
    </div>
  );
}
