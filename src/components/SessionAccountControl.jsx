import { ChevronDown, ExternalLink, LogIn, LogOut, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { authRequest } from '../lib/auth-api';
import { getAccountUrl } from '../lib/site-urls';

export function SessionAccountControl({ buttonClassName, compact = false, onOpenAuth, onSessionChange, session }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const controlRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event) => !controlRef.current?.contains(event.target) && setIsOpen(false);
    const closeOnEscape = (event) => event.key === 'Escape' && setIsOpen(false);
    document.addEventListener('pointerdown', closeOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  if (session.status !== 'authorized') {
    return (
      <button aria-busy={session.status === 'loading'} aria-label="Войти в личный кабинет" className={buttonClassName} disabled={session.status === 'loading'} onClick={() => onOpenAuth('login')} type="button">
        <LogIn size={18} strokeWidth={2.2} />
        <span>Войти</span>
      </button>
    );
  }

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await authRequest('/logout', { method: 'POST', body: '{}' });
      setIsOpen(false);
      onSessionChange({ status: 'unauthorized', user: null });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={compact ? 'header__mobile-account' : 'header__account'} ref={controlRef}>
      <button aria-expanded={isOpen} aria-haspopup="menu" className={buttonClassName} onClick={() => setIsOpen((current) => !current)} title={session.user.email} type="button">
        <UserRound size={18} strokeWidth={2.2} />
        <span className="header__account-email">{session.user.email}</span>
        <ChevronDown className={isOpen ? 'header__account-chevron header__account-chevron--open' : 'header__account-chevron'} size={15} />
      </button>
      {isOpen && (
        <div className="header__account-menu" role="menu">
          <a href={getAccountUrl('/account')} rel="noreferrer" role="menuitem" target="_blank"><ExternalLink size={17} />Личный кабинет</a>
          <button disabled={isLoggingOut} onClick={logout} role="menuitem" type="button"><LogOut size={17} />{isLoggingOut ? 'Выходим…' : 'Выйти'}</button>
        </div>
      )}
    </div>
  );
}
