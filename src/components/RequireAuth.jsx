import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authRequest } from '../lib/auth-api';

export function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    authRequest('/me')
      .then(() => active && setStatus('authorized'))
      .catch(() => active && setStatus('unauthorized'));
    return () => {
      active = false;
    };
  }, []);

  if (status === 'loading') {
    return <main className="account-access"><span className="account-access__loader" /><p>Проверяем доступ…</p></main>;
  }

  if (status === 'unauthorized') {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return children;
}
