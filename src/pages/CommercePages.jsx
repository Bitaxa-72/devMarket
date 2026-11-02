import { Check, CreditCard, FileText, Minus, Plus, ReceiptText, ShieldCheck, Trash2, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { paymentMethods } from '../data/site-data';

const getPrice = (value) => Number(value.replace(/[^\d]/g, '')) || 0;
const formatPrice = (value) => new Intl.NumberFormat('ru-RU').format(value);

export function PaymentPage() {
  const [amount, setAmount] = useState('5000');

  return (
    <main>
      <PageHero title="Оплата и документы" breadcrumbs={[{ label: 'Оплата' }]} compact />
      <section className="payment-page">
        <div className="payment-page__container">
          <div className="payment-page__content">
            <span className="section-label">Способы оплаты</span><h2>Выберите удобный вариант</h2>
            <div className="payment-page__methods">
              {paymentMethods.map((method, index) => {
                const icons = [CreditCard, WalletCards, ReceiptText];
                const Icon = icons[index];
                return <article key={method.title}><Icon size={28} strokeWidth={1.7} /><div><h3>{method.title}</h3><p>{method.description}</p></div></article>;
              })}
            </div>
            <div className="payment-page__documents">
              <h2>Документы</h2>
              <p>Для юридических лиц доступны счёт, акт и договор. Документы формируются в личном кабинете и отправляются на указанную почту.</p>
              <div><Link to="/offer"><FileText size={18} />Публичная оферта</Link><Link to="/privacy"><ShieldCheck size={18} />Политика конфиденциальности</Link></div>
            </div>
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
      </section>
    </main>
  );
}

export function CartPage() {
  const { cartItems, updateCartItem } = useOutletContext();
  const total = cartItems.reduce((sum, item) => sum + getPrice(item.price) * item.quantity, 0);

  return (
    <main>
      <PageHero title="Ваш заказ" breadcrumbs={[{ label: 'Корзина' }]} compact />
      <section className="cart-page">
        <div className="cart-page__container">
          {cartItems.length === 0 ? (
            <div className="empty-state"><ShoppingBagIcon /><h2>Корзина пока пуста</h2><p>Добавьте готовое решение из каталога, чтобы перейти к оформлению.</p><Link className="ui-button ui-button--primary" to="/catalog">Перейти в каталог</Link></div>
          ) : (
            <>
              <div className="cart-page__items">
                {cartItems.map((item) => (
                  <article className="cart-item" key={item.slug}>
                    <div className={`cart-item__visual cart-item__visual--${item.accent}`}>{item.title.slice(0, 1)}</div>
                    <div className="cart-item__content"><span>{item.categoryTitle}</span><h2><Link to={`/product/${item.slug}`}>{item.title}</Link></h2><p>{item.description}</p></div>
                    <div className="quantity-control"><button type="button" aria-label="Уменьшить количество" onClick={() => updateCartItem(item.slug, item.quantity - 1)}><Minus size={16} /></button><span>{item.quantity}</span><button type="button" aria-label="Увеличить количество" onClick={() => updateCartItem(item.slug, item.quantity + 1)}><Plus size={16} /></button></div>
                    <strong>{formatPrice(getPrice(item.price) * item.quantity)} ₽</strong>
                    <button className="cart-item__remove" type="button" aria-label={`Удалить «${item.title}»`} onClick={() => updateCartItem(item.slug, 0)}><Trash2 size={18} /></button>
                  </article>
                ))}
              </div>
              <aside className="cart-summary"><h2>Итого</h2><div><span>Позиций</span><strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></div><div><span>Предварительная стоимость</span><strong>{formatPrice(total)} ₽</strong></div><p>Точная стоимость фиксируется после уточнения состава работ.</p><Link className="ui-button ui-button--primary" to="/checkout">Перейти к оформлению</Link><Link className="cart-summary__back" to="/catalog">Продолжить покупки</Link></aside>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function ShoppingBagIcon() {
  return <span className="empty-state__icon"><WalletCards size={42} strokeWidth={1.5} /></span>;
}

export function CheckoutPage() {
  const { cartItems, clearCart } = useOutletContext();
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState('person');
  const total = cartItems.reduce((sum, item) => sum + getPrice(item.price) * item.quantity, 0);

  const submitOrder = (event) => {
    event.preventDefault();
    clearCart();
    navigate('/checkout/success');
  };

  if (!cartItems.length) {
    return <main><PageHero title="Нет товаров для оформления" breadcrumbs={[{ label: 'Корзина', to: '/cart' }, { label: 'Оформление' }]} compact /><div className="state-page"><Link className="ui-button ui-button--primary" to="/catalog">Перейти в каталог</Link></div></main>;
  }

  return (
    <main>
      <PageHero title="Оформление заказа" breadcrumbs={[{ label: 'Корзина', to: '/cart' }, { label: 'Оформление' }]} compact />
      <section className="checkout-page">
        <form className="checkout-page__form" onSubmit={submitOrder}>
          <div className="form-section"><span>01</span><div><h2>Тип заказчика</h2><div className="segmented-control"><button className={customerType === 'person' ? 'segmented-control__button segmented-control__button--active' : 'segmented-control__button'} type="button" onClick={() => setCustomerType('person')}>Физическое лицо</button><button className={customerType === 'company' ? 'segmented-control__button segmented-control__button--active' : 'segmented-control__button'} type="button" onClick={() => setCustomerType('company')}>Компания или ИП</button></div></div></div>
          <div className="form-section"><span>02</span><div><h2>Контактные данные</h2><div className="form-grid"><label><span>Имя</span><input required name="name" autoComplete="name" /></label><label><span>Email</span><input required type="email" name="email" autoComplete="email" /></label><label><span>Телефон или мессенджер</span><input required name="contact" /></label>{customerType === 'company' && <label><span>ИНН компании</span><input required name="taxId" /></label>}</div></div></div>
          <div className="form-section"><span>03</span><div><h2>Комментарий</h2><label><span>Что важно учесть?</span><textarea name="comment" rows="5" placeholder="Расскажите о задаче, сроках и пожеланиях" /></label></div></div>
          <label className="form-consent"><input required type="checkbox" /><span>Согласен с <Link to="/offer">условиями оферты</Link> и <Link to="/privacy">политикой конфиденциальности</Link></span></label>
          <button className="ui-button ui-button--primary" type="submit">Оформить заказ</button>
        </form>
        <aside className="checkout-summary"><h2>Состав заказа</h2>{cartItems.map((item) => <div className="checkout-summary__item" key={item.slug}><span>{item.title} × {item.quantity}</span><strong>{formatPrice(getPrice(item.price) * item.quantity)} ₽</strong></div>)}<div className="checkout-summary__total"><span>Итого</span><strong>{formatPrice(total)} ₽</strong></div><p><ShieldCheck size={17} />Данные защищены и используются только для оформления заказа.</p></aside>
      </section>
    </main>
  );
}

export function CheckoutSuccessPage() {
  return (
    <main className="success-page"><div className="success-page__content"><span><Check size={42} strokeWidth={2} /></span><small>Заказ принят</small><h1>Спасибо! Начинаем знакомство</h1><p>Мы отправили подтверждение и свяжемся с вами, чтобы уточнить детали проекта.</p><div><Link className="ui-button ui-button--primary" to="/account">Перейти в личный кабинет</Link><Link className="ui-button ui-button--outline" to="/">На главную</Link></div></div></main>
  );
}
