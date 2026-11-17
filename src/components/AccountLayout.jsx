import { ExternalLink } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { getPublicSiteUrl } from '../lib/site-urls';
import { Logo } from './Logo';

export function AccountLayout() {
  return (
    <div className="account-site">
      <header className="account-site__header">
        <div className="account-site__header-container">
          <div className="account-site__identity">
            <Logo />
            <span>Личный кабинет</span>
          </div>
          <a className="account-site__public-link" href={getPublicSiteUrl()}>
            На основной сайт
            <ExternalLink size={17} />
          </a>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
