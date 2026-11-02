import { ChevronDown, ChevronRight, Ellipsis, FileText, FolderKanban, Languages, LayoutGrid, LogIn, MessageCircle, Newspaper, Percent, Search, ShieldCheck, ShoppingCart, WalletCards, Wrench, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

const navigationItems = [
  { label: 'Услуги', to: '/services' },
  { label: 'Наши проекты', to: '/projects' },
  { label: 'Акции', to: '/promotions' },
  { label: 'Оплата', to: '/payment' },
  { label: 'Новости', to: '/news' },
];

const catalogItems = [
  { label: 'Боты', to: '/catalog/bots' },
  { label: 'Сайты', to: '/catalog/sites' },
  { label: 'Разработка под ключ', to: '/catalog/custom' },
  { label: 'CRM', to: '/catalog/crm' },
  { label: 'Интеграции', to: '/catalog/integrations' },
  { label: 'Приложения', to: '/catalog/apps' },
];

const moreItems = [
  { label: 'Проекты', to: '/projects', icon: FolderKanban },
  { label: 'Новости', to: '/news', icon: Newspaper },
  { label: 'Акции', to: '/promotions', icon: Percent },
  { label: 'Оплата', to: '/payment', icon: WalletCards },
];

const legalItems = [
  { label: 'Политика конфиденциальности', to: '/privacy', icon: ShieldCheck },
  { label: 'Публичная оферта', to: '/offer', icon: FileText },
];

const languageOptions = [
  { code: 'RU', name: 'Русский' },
  { code: 'EN', name: 'English' },
  { code: 'VI', name: 'Tiếng Việt' },
];

export function Header({ onOpenContacts, cartCount = 0 }) {
  const navigate = useNavigate();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(languageOptions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.scrollY > 96);
  const [moreDrag, setMoreDrag] = useState({ x: 0, y: 0, active: false });
  const searchInputRef = useRef(null);
  const searchFormRef = useRef(null);
  const searchToggleRef = useRef(null);
  const moreDragStartRef = useRef(null);
  const moreCloseTimerRef = useRef(null);
  const scrollFrameRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setIsCatalogOpen(false);
      setIsLanguageOpen(false);
      setIsMoreOpen(false);
      setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const closeSearchOutside = (event) => {
      if (searchFormRef.current?.contains(event.target) || searchToggleRef.current?.contains(event.target)) return;
      setIsSearchOpen(false);
    };
    document.addEventListener('pointerdown', closeSearchOutside);
    return () => document.removeEventListener('pointerdown', closeSearchOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        setIsCompact((current) => current ? window.scrollY > 12 : window.scrollY > 96);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(moreCloseTimerRef.current), []);

  const closePanels = () => {
    setIsCatalogOpen(false);
    setIsLanguageOpen(false);
    setIsMoreOpen(false);
  };

  const selectLanguage = (language) => {
    setActiveLanguage(language);
    setIsLanguageOpen(false);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setIsSearchOpen(false);
    closePanels();
  };

  const openContacts = () => {
    closePanels();
    onOpenContacts();
  };

  const startMoreDrag = (event) => {
    moreDragStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    setMoreDrag({ x: 0, y: 0, active: true });
  };

  const moveMoreDrag = (event) => {
    const start = moreDragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.hypot(x, y) < 10) return;
    setMoreDrag({ x: x * 0.88, y: y * 0.88, active: true });
  };

  const finishMoreDrag = (event) => {
    const start = moreDragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    const distance = Math.hypot(x, y);
    moreDragStartRef.current = null;
    if (distance < 76) {
      setMoreDrag({ x: 0, y: 0, active: false });
      return;
    }
    const exitDistance = Math.max(window.innerWidth, window.innerHeight) * 1.15;
    const multiplier = exitDistance / distance;
    setMoreDrag({ x: x * multiplier, y: y * multiplier, active: false });
    moreCloseTimerRef.current = window.setTimeout(() => {
      setIsMoreOpen(false);
      setMoreDrag({ x: 0, y: 0, active: false });
    }, 220);
  };

  const cancelMoreDrag = () => {
    moreDragStartRef.current = null;
    setMoreDrag({ x: 0, y: 0, active: false });
  };

  const languageMenu = (
    <div className={`header__language-menu ${isLanguageOpen ? 'header__language-menu--open' : ''}`}>
      {languageOptions.map((language) => (
        <button className={`header__language-option ${activeLanguage.code === language.code ? 'header__language-option--active' : ''}`} key={language.code} type="button" onClick={() => selectLanguage(language)}>
          <span>{language.name}</span>
          <span>{language.code}</span>
        </button>
      ))}
    </div>
  );

  return (
    <header className={isCompact ? 'header header--compact' : 'header'}>
      <div className="header__top">
        <div className="header__container header__top-container">
          <Logo />
          <form ref={searchFormRef} className={`header__search ${isSearchOpen ? 'header__search--open' : ''}`} id="header-search" role="search" onSubmit={submitSearch}>
            <label className="header__search-label" aria-label="Поиск по проектам и услугам">
              <input ref={searchInputRef} className="header__search-input" type="search" placeholder="Что вы ищете?" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </label>
            <button className="header__search-button" type="submit" aria-label="Найти"><Search size={22} strokeWidth={2} /></button>
          </form>
          <div className="header__actions">
            <Link className="header__login" to="/login"><LogIn size={18} strokeWidth={2.2} /><span>Войти</span></Link>
            <div className="header__language">
              <button className="header__language-button" type="button" aria-expanded={isLanguageOpen} onClick={() => setIsLanguageOpen((value) => !value)}><Languages size={19} strokeWidth={2} /><span>{activeLanguage.code}</span><ChevronDown className={`header__language-chevron ${isLanguageOpen ? 'header__language-chevron--open' : ''}`} size={16} strokeWidth={2.4} /></button>
              {languageMenu}
            </div>
          </div>
          <button ref={searchToggleRef} className="header__mobile-search-toggle" type="button" aria-label={isSearchOpen ? 'Скрыть поиск' : 'Открыть поиск'} aria-controls="header-search" aria-expanded={isSearchOpen} onClick={() => { setIsSearchOpen((value) => !value); closePanels(); }}><Search size={21} strokeWidth={2.1} /></button>
          <div className="header__mobile-language">
            <button className="header__mobile-language-button" type="button" aria-label="Выбрать язык" aria-expanded={isLanguageOpen} onClick={() => { setIsLanguageOpen((value) => !value); setIsSearchOpen(false); setIsMoreOpen(false); }}><span>{activeLanguage.code}</span><ChevronDown className={`header__language-chevron ${isLanguageOpen ? 'header__language-chevron--open' : ''}`} size={14} strokeWidth={2.4} /></button>
            {languageMenu}
          </div>
          <Link className="header__mobile-login" to="/login" aria-label="Войти в личный кабинет"><LogIn size={18} strokeWidth={2.2} /><span>Войти</span></Link>
        </div>
      </div>
      <div className="header__navigation-wrapper">
        <div className="header__container header__navigation-container">
          <nav className="header__navigation" aria-label="Основная навигация">
            <div className="header__catalog" onMouseEnter={() => setIsCatalogOpen(true)} onMouseLeave={() => setIsCatalogOpen(false)}>
              <div className="header__catalog-trigger"><NavLink className={({ isActive }) => `header__catalog-link ${isActive ? 'header__catalog-link--active' : ''}`} to="/catalog" onClick={closePanels}>Каталог</NavLink><button className="header__catalog-toggle" type="button" aria-label="Открыть категории каталога" aria-expanded={isCatalogOpen} onClick={() => setIsCatalogOpen((value) => !value)}><ChevronDown className={`header__catalog-chevron ${isCatalogOpen ? 'header__catalog-chevron--open' : ''}`} size={17} strokeWidth={2.4} /></button></div>
              <div className={`header__catalog-menu ${isCatalogOpen ? 'header__catalog-menu--open' : ''}`}><Link className="header__catalog-menu-link" to="/catalog" onClick={closePanels}>Все решения</Link>{catalogItems.map((item) => <Link className="header__catalog-menu-link" to={item.to} key={item.label} onClick={closePanels}>{item.label}</Link>)}</div>
            </div>
            {navigationItems.map((item) => <NavLink className="header__navigation-link" to={item.to} key={item.label} onClick={closePanels}>{item.label}</NavLink>)}
          </nav>
          <div className="header__navigation-actions">
            <button className="header__navigation-message" type="button" onClick={openContacts}><MessageCircle size={19} strokeWidth={2} /><span>Связаться</span></button>
            <Link className="header__cart" to="/cart" aria-label={`Корзина, товаров: ${cartCount}`}><ShoppingCart size={19} strokeWidth={2} /><span>Корзина</span><span className="header__cart-count">{cartCount}</span></Link>
          </div>
        </div>
      </div>
      {isMoreOpen && (
        <div className="header__more-overlay" onClick={() => setIsMoreOpen(false)}>
          <section className={`header__more-sheet ${moreDrag.active ? 'header__more-sheet--dragging' : ''}`} role="dialog" aria-modal="true" aria-label="Разделы и документы" style={{ transform: `translate3d(${moreDrag.x}px, ${moreDrag.y}px, 0)`, opacity: Math.max(0.65, 1 - Math.hypot(moreDrag.x, moreDrag.y) / 420) }} onPointerDown={startMoreDrag} onPointerMove={moveMoreDrag} onPointerUp={finishMoreDrag} onPointerCancel={cancelMoreDrag} onClick={(event) => event.stopPropagation()}>
            <span className="header__more-handle" aria-hidden="true" />
            <div className="header__more-heading"><h2 className="header__more-title">Разделы и документы</h2><button className="header__more-close" type="button" aria-label="Закрыть" onClick={() => setIsMoreOpen(false)}><X size={19} /></button></div>
            <nav className="header__more-list" aria-label="Дополнительные разделы">
              {moreItems.map(({ icon: Icon, ...item }) => <NavLink className={({ isActive }) => `header__more-link header__more-link--primary ${isActive ? 'header__more-link--active' : ''}`} to={item.to} key={item.to} onClick={closePanels}><span className="header__more-icon"><Icon size={21} strokeWidth={2} /></span><span>{item.label}</span></NavLink>)}
            </nav>
            <div className="header__more-documents">{legalItems.map(({ icon: Icon, ...item }) => <NavLink className={({ isActive }) => `header__more-link header__more-link--legal ${isActive ? 'header__more-link--active' : ''}`} to={item.to} key={item.to} onClick={closePanels}><span className="header__more-icon"><Icon size={18} strokeWidth={2} /></span><span>{item.label}</span><ChevronRight size={17} strokeWidth={2} /></NavLink>)}</div>
          </section>
        </div>
      )}
      <div className="header__mobile-dock" aria-label="Быстрые действия">
        <NavLink className={({ isActive }) => `header__mobile-dock-item ${isActive ? 'header__mobile-dock-item--active' : ''}`} to="/catalog" onClick={closePanels}><LayoutGrid size={21} strokeWidth={2} /><span>Каталог</span></NavLink>
        <NavLink className={({ isActive }) => `header__mobile-dock-item ${isActive ? 'header__mobile-dock-item--active' : ''}`} to="/services" onClick={closePanels}><Wrench size={21} strokeWidth={2} /><span>Услуги</span></NavLink>
        <button className="header__mobile-dock-item header__mobile-contact" type="button" onClick={openContacts}><MessageCircle size={21} strokeWidth={2} /><span>Связь</span></button>
        <NavLink className={({ isActive }) => `header__mobile-dock-item header__mobile-cart ${isActive ? 'header__mobile-dock-item--active' : ''}`} to="/cart" aria-label={`Корзина, товаров: ${cartCount}`} onClick={closePanels}><ShoppingCart size={21} strokeWidth={2} /><span>Корзина</span><span className="header__cart-count">{cartCount}</span></NavLink>
        <button className={`header__mobile-dock-item header__mobile-more ${isMoreOpen ? 'header__mobile-dock-item--active' : ''}`} type="button" aria-expanded={isMoreOpen} onClick={() => { setIsMoreOpen((value) => !value); setIsLanguageOpen(false); setIsSearchOpen(false); }}><Ellipsis size={22} strokeWidth={2.2} /><span>Ещё</span></button>
      </div>
    </header>
  );
}
