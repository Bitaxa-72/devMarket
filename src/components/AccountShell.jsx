import { BadgePercent, BriefcaseBusiness, ChevronDown, CreditCard, ExternalLink, LayoutDashboard, ListTodo, LockKeyhole, LogOut, MessageCircle, Newspaper, PackageCheck, Store, UserRound, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { accountBalance } from '../data/account-data';
import { getAccountNavigation } from '../lib/account-navigation';
import { authRequest } from '../lib/auth-api';
import { getPublicSiteUrl } from '../lib/site-urls';
import { Logo } from './Logo';
import { useAccountSession } from './AccountSessionContext';

const navigationIcons = { orders: PackageCheck, payment: CreditCard, profile: UserRound, security: LockKeyhole, chat: MessageCircle, dashboard: LayoutDashboard, store: Store, tracker: ListTodo, users: UsersRound, news: Newspaper, portfolio: BriefcaseBusiness, promotions: BadgePercent };

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
  const [storeOpen, setStoreOpen] = useState(activeTab?.startsWith('store-'));
  const accountNavigation = getAccountNavigation(user);
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
            <a aria-label="На основной сайт" className="account-site__public-link" href={getPublicSiteUrl()}><span>На основной сайт</span><ExternalLink size={17} /></a>
            <button aria-label={logoutPending ? 'Выходим из аккаунта' : 'Выйти из аккаунта'} className="account-site__logout" disabled={logoutPending} onClick={logout} type="button"><LogOut size={18} /><span>{logoutPending ? 'Выходим…' : 'Выйти'}</span></button>
          </div>
        </div>
      </header>
      <section className="account-page">
        <div className="account-page__container">
          <aside className="account-page__sidebar" aria-label="Разделы кабинета">
            {accountNavigation.map((item) => {
              const Icon = navigationIcons[item.id];
              if (item.children) return <div className="account-page__group" key={item.id}>
                <button className={activeTab?.startsWith('store-') ? 'account-page__tab account-page__tab--active' : 'account-page__tab'} type="button" aria-expanded={storeOpen} onClick={() => setStoreOpen((value) => !value)}><Icon size={19} />{item.label}<ChevronDown className={storeOpen ? 'account-page__chevron account-page__chevron--open' : 'account-page__chevron'} size={16} /></button>
                {storeOpen && <div className="account-page__subnav">{item.children.map((child) => <Link className={activeTab === child.id ? 'account-page__subtab account-page__subtab--active' : 'account-page__subtab'} aria-current={activeTab === child.id ? 'page' : undefined} to={child.to} key={child.id}>{child.label}</Link>)}</div>}
              </div>;
              return <Link className={activeTab === item.id ? 'account-page__tab account-page__tab--active' : 'account-page__tab'} aria-current={activeTab === item.id ? 'page' : undefined} to={item.to} key={item.id}><Icon size={19} />{item.label}</Link>;
            })}
          </aside>
          <div className="account-page__content">{children}</div>
        </div>
      </section>
    </main>
  );
}
