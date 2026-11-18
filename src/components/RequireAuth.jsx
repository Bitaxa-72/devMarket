import { useEffect, useState } from 'react';
import { authRequest } from '../lib/auth-api';
import { getPublicSiteUrl } from '../lib/site-urls';
import { AccountSessionProvider } from './AccountSessionContext';

export function RequireAuth({ children }) {
  const [session, setSession] = useState({ status: 'loading', user: null });

  useEffect(() => {
    let active = true;
    authRequest('/me')
      .then(({ user }) => active && setSession({ status: 'authorized', user }))
      .catch(() => active && setSession({ status: 'unauthorized', user: null }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (session.status === 'unauthorized') window.location.replace(getPublicSiteUrl('/?auth=login'));
  }, [session.status]);

  if (session.status === 'loading') {
    return <main className="account-access"><span className="account-access__loader" /><p>Проверяем доступ…</p></main>;
  }

  if (session.status === 'unauthorized') {
    return <main className="account-access"><span className="account-access__loader" /><p>Открываем страницу входа…</p></main>;
  }

  return <AccountSessionProvider value={session.user}>{children}</AccountSessionProvider>;
}
