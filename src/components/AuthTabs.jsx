import { NavLink } from 'react-router-dom';

export function AuthTabs() {
  return (
    <nav className="auth-tabs" aria-label="Вход и регистрация">
      <NavLink className={({ isActive }) => `auth-tabs__link ${isActive ? 'auth-tabs__link--active' : ''}`} end to="/login">Вход</NavLink>
      <NavLink className={({ isActive }) => `auth-tabs__link ${isActive ? 'auth-tabs__link--active' : ''}`} to="/register">Регистрация</NavLink>
    </nav>
  );
}
