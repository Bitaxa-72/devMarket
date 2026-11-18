import { LogIn, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAccountUrl } from '../lib/site-urls';

export function SessionAccountLink({ className, compact = false, session }) {
  if (session.status === 'authorized') {
    return (
      <a
        aria-label="Открыть личный кабинет в новой вкладке"
        className={className}
        href={getAccountUrl('/account')}
        rel="noreferrer"
        target="_blank"
      >
        <UserRound size={18} strokeWidth={2.2} />
        <span>{compact ? 'Кабинет' : 'Личный кабинет'}</span>
      </a>
    );
  }

  return (
    <Link aria-busy={session.status === 'loading'} aria-label="Войти в личный кабинет" className={className} to="/login">
      <LogIn size={18} strokeWidth={2.2} />
      <span>Войти</span>
    </Link>
  );
}
