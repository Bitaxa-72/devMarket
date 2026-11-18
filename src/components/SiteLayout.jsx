import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthModal } from './AuthModal';
import { ContactModal } from './ContactModal';
import { CookieConsent } from './CookieConsent';
import { Footer } from './Footer';
import { Header } from './Header';
import { TrustBand } from './TrustBand';
import { authRequest } from '../lib/auth-api';
import { animateProductToCart } from '../utils/cart-animation';

const pageMeta = [
  { match: /^\/$/, title: 'Devmarket — цифровые продукты для бизнеса', description: 'Готовые цифровые решения и разработка под ключ для бизнеса.' },
  { match: /^\/catalog/, title: 'Каталог цифровых решений — Devmarket', description: 'Боты, сайты, CRM, интеграции и приложения с возможностью доработки.' },
  { match: /^\/product/, title: 'Готовое решение — Devmarket', description: 'Описание, состав работ, сроки и стоимость готового цифрового решения.' },
  { match: /^\/services/, title: 'Услуги разработки — Devmarket', description: 'Аудит, дизайн, разработка, интеграции и поддержка цифровых продуктов.' },
  { match: /^\/projects/, title: 'Портфолио — Devmarket', description: 'Реализованные цифровые продукты и результаты для бизнеса.' },
  { match: /^\/promotions/, title: 'Акции — Devmarket', description: 'Специальные условия на разработку и поддержку проектов.' },
  { match: /^\/payment/, title: 'Оплата и документы — Devmarket', description: 'Способы оплаты, пополнение баланса и документы по услугам.' },
  { match: /^\/news/, title: 'Новости и статьи — Devmarket', description: 'Практические материалы о разработке и автоматизации бизнеса.' },
  { match: /^\/contacts/, title: 'Контакты — Devmarket', description: 'Связь с удалённой командой разработки Devmarket.' },
  { match: /^\/cart/, title: 'Корзина — Devmarket', description: 'Выбранные цифровые решения и предварительная стоимость заказа.' },
  { match: /^\/checkout/, title: 'Оформление заказа — Devmarket', description: 'Контактные данные и состав заказа на разработку.' },
  { match: /^\/account/, title: 'Личный кабинет — Devmarket', description: 'Заказы, профиль, безопасность и чат с менеджером.' },
  { match: /^\/login/, title: 'Вход в личный кабинет — Devmarket', description: 'Вход и восстановление доступа к личному кабинету Devmarket.' },
  { match: /^\/register/, title: 'Регистрация — Devmarket', description: 'Регистрация и подтверждение email для доступа к личному кабинету Devmarket.' },
  { match: /^\/(forgot-password|reset-password)/, title: 'Восстановление доступа — Devmarket', description: 'Безопасное восстановление доступа к личному кабинету Devmarket.' },
  { match: /^\/verify-email/, title: 'Подтверждение email — Devmarket', description: 'Подтверждение email для входа в личный кабинет Devmarket.' },
  { match: /^\/search/, title: 'Поиск — Devmarket', description: 'Поиск по решениям, проектам и статьям Devmarket.' },
  { match: /^\/privacy/, title: 'Политика конфиденциальности — Devmarket', description: 'Условия обработки персональных данных.' },
  { match: /^\/offer/, title: 'Публичная оферта — Devmarket', description: 'Условия оказания и оплаты услуг Devmarket.' },
];

export function SiteLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = /^\/(reset-password|verify-email)$/.test(location.pathname);
  const previousPathnameRef = useRef(null);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [authSession, setAuthSession] = useState({ status: 'loading', user: null });
  const [authModalMode, setAuthModalMode] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = window.localStorage.getItem('devmarket-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    let active = true;
    authRequest('/me')
      .then(({ user }) => active && setAuthSession({ status: 'authorized', user }))
      .catch(() => active && setAuthSession({ status: 'unauthorized', user: null }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const requestedMode = new URLSearchParams(location.search).get('auth');
    if (['login', 'register', 'forgot'].includes(requestedMode)) setAuthModalMode(requestedMode);
  }, [location.search]);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    const isCatalogPath = (pathname) => pathname === '/catalog' || pathname.startsWith('/catalog/');
    const isCatalogCategorySwitch = previousPathname && isCatalogPath(previousPathname) && isCatalogPath(location.pathname);

    if (location.hash) {
      window.setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }), 0);
    } else if (!isCatalogCategorySwitch) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    previousPathnameRef.current = location.pathname;

    const meta = pageMeta.find((item) => item.match.test(location.pathname)) || pageMeta[0];
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    window.localStorage.setItem('devmarket-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, source) => {
    animateProductToCart(source, product);
    setCartItems((items) => {
      const existingItem = items.find((item) => item.slug === product.slug);

      if (existingItem) {
        return items.map((item) => item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item);
      }

      return [...items, { ...product, quantity: 1 }];
    });
  };

  const updateCartItem = (slug, quantity) => {
    if (quantity < 1) {
      setCartItems((items) => items.filter((item) => item.slug !== slug));
      return;
    }

    setCartItems((items) => items.map((item) => item.slug === slug ? { ...item, quantity } : item));
  };

  const clearCart = () => setCartItems([]);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const openContacts = (subject) => {
    setContactSubject(typeof subject === 'string' ? subject : '');
    setIsContactsOpen(true);
  };
  const openAuthModal = useCallback((mode = 'login') => setAuthModalMode(mode), []);
  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null);
    const params = new URLSearchParams(location.search);
    if (!params.has('auth')) return;
    params.delete('auth');
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params}` : '' }, { replace: true });
  }, [location.pathname, location.search, navigate]);
  const completeLogin = useCallback((user) => {
    setAuthSession({ status: 'authorized', user });
    closeAuthModal();
  }, [closeAuthModal]);

  return (
    <>
      <Header authSession={authSession} onOpenAuth={openAuthModal} onOpenContacts={openContacts} onSessionChange={setAuthSession} cartCount={cartCount} />
      <Outlet context={{ addToCart, authSession, cartItems, clearCart, onOpenAuth: openAuthModal, onOpenContacts: openContacts, updateCartItem }} />
      {location.pathname !== '/' && !isAuthPage && <TrustBand />}
      {!isAuthPage && <Footer onOpenContacts={openContacts} />}
      <ContactModal isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} subject={contactSubject} />
      <AuthModal initialMode={authModalMode || 'login'} isOpen={Boolean(authModalMode)} onAuthenticated={completeLogin} onClose={closeAuthModal} />
      <CookieConsent />
    </>
  );
}
