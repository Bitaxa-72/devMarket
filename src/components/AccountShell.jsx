import { CreditCard, ExternalLink, LockKeyhole, LogOut, MessageCircle, PackageCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { accountBalance } from '../data/account-data';
import { authRequest } from '../lib/auth-api';
import { getPublicSiteUrl } from '../lib/site-urls';
import { Logo } from './Logo';
import { useAccountSession } from './AccountSessionContext';

const accountNavigation = [
  { id: 'orders', label: 'Заказы', icon: PackageCheck, to: '/account' },
  { id: 'payment', label: 'Оплата', icon: CreditCard, to: '/account/payment' },
  { id: 'profile', label: 'Личные данные', icon: UserRound, to: '/account?tab=profile' },
  { id: 'security', label: 'Безопасность', icon: LockKeyhole, to: '/account?tab=security' },
  { id: 'chat', label: 'Чат', icon: MessageCircle, to: '/account?tab=chat' },
];

const roleLabels = { customer: 'Клиент', manager: 'Менеджер', admin: 'Администратор' };

function getUserPresentation(user) {
  const names = [user?.firstName, user?.lastName].map((value) => value?.trim()).filter(Boolean);
  const name = names.join(' ') || user?.email || 'Пользователь';
  const initials = names.length
    ? names.map((value) => value[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email?.[0] || 'П').toUpperCase();
  return { firstName: names[0] || user?.email || 'пользователь', initials, name, role: roleLabels[user?.role] || 'Клиент' };
}

export function AccountShell({ activeTab, children, title }) {
  const user = useAccountSession();
  const profile = getUserPresentation(user);
  const [logoutPending, setLogoutPending] = useState(false);
  const pageTitle = title || `Здравствуйте, ${profile.firstName}`;
  const logout = async () => {
    setLogoutPending(true);
    await authRequest('/logout', { method: 'POST' }).catch(() => undefined);
    window.location.replace(getPublicSiteUrl());
  };

  return (
    <main className="account-workspace">
      <header className="account-site__header">
        <div className="account-site__header-container">
          <div className="account-site__identity">
            <Logo />
            <h1 className="account-site__title">{pageTitle}</h1>
          </div>
          <div className="account-site__actions">
            <div className="account-balance"><span>Баланс</span><strong>{accountBalance}</strong></div>
            <div className="account-user">
              <span className="account-user__avatar" aria-hidden="true">{profile.initials}</span>
              <span className="account-user__details"><strong className="account-user__name">{profile.name}</strong><small className="account-user__role">{profile.role}</small></span>
            </div>
            <a className="account-site__public-link" href={getPublicSiteUrl()}><span>На основной сайт</span><ExternalLink size={17} /></a>
            <button className="account-site__logout" disabled={logoutPending} onClick={logout} type="button"><LogOut size={18} /><span>{logoutPending ? 'Выходим…' : 'Выйти'}</span></button>
          </div>
        </div>
      </header>
      <section className="account-page">
        <div className="account-page__container">
          <aside className="account-page__sidebar">
            {accountNavigation.map((item) => {
              const Icon = item.icon;
              return <Link className={activeTab === item.id ? 'account-page__tab account-page__tab--active' : 'account-page__tab'} to={item.to} key={item.id}><Icon size={19} />{item.label}</Link>;
            })}
          </aside>
          <div className="account-page__content">{children}</div>
        </div>
      </section>
    </main>
  );
}
