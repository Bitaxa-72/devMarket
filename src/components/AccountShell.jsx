import { CreditCard, LockKeyhole, LogOut, MessageCircle, PackageCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountBalance } from '../data/account-data';
import { PageHero } from './PageHero';

const accountNavigation = [
  { id: 'orders', label: 'Заказы', icon: PackageCheck, to: '/account' },
  { id: 'payment', label: 'Оплата', icon: CreditCard, to: '/account/payment' },
  { id: 'profile', label: 'Личные данные', icon: UserRound, to: '/account?tab=profile' },
  { id: 'security', label: 'Безопасность', icon: LockKeyhole, to: '/account?tab=security' },
  { id: 'chat', label: 'Чат', icon: MessageCircle, to: '/account?tab=chat' },
];

export function AccountShell({ activeTab, breadcrumbs = [], children, title = 'Здравствуйте, Алексей' }) {
  return (
    <main>
      <PageHero title={title} breadcrumbs={[{ label: 'Личный кабинет', to: breadcrumbs.length ? '/account' : undefined }, ...breadcrumbs]} compact>
        <div className="account-balance"><span>Баланс</span><strong>{accountBalance}</strong></div>
      </PageHero>
      <section className="account-page">
        <div className="account-page__container">
          <aside className="account-page__sidebar">
            {accountNavigation.map((item) => {
              const Icon = item.icon;
              return <Link className={activeTab === item.id ? 'account-page__tab account-page__tab--active' : 'account-page__tab'} to={item.to} key={item.id}><Icon size={19} />{item.label}</Link>;
            })}
            <Link className="account-page__logout" to="/login"><LogOut size={18} />Выйти</Link>
          </aside>
          <div className="account-page__content">{children}</div>
        </div>
      </section>
    </main>
  );
}
