const customerNavigation = [
  { id: 'orders', label: 'Заказы', to: '/account' },
  { id: 'payment', label: 'Оплата', to: '/account/payment' },
  { id: 'profile', label: 'Личные данные', to: '/account?tab=profile' },
  { id: 'security', label: 'Безопасность', to: '/account?tab=security' },
  { id: 'chat', label: 'Чат', to: '/account?tab=chat' },
];

const adminNavigation = [
  { id: 'dashboard', label: 'Дашборд', to: '/account', permission: 'dashboard' },
  { id: 'store', label: 'Магазин', children: [
    { id: 'store-orders', label: 'Заказы', to: '/account?section=store-orders', permission: 'store-orders' },
    { id: 'store-catalog', label: 'Каталог', to: '/account?section=store-catalog', permission: 'store-catalog' },
    { id: 'store-services', label: 'Услуги', to: '/account?section=store-services', permission: 'store-services' },
  ] },
  { id: 'tracker', label: 'Трекер', to: '/account?section=tracker', permission: 'tracker' },
  { id: 'users', label: 'Пользователи', to: '/account?section=users', permission: 'users' },
  { id: 'chat', label: 'Чат', to: '/account?section=chat', permission: 'chat' },
  { id: 'news', label: 'Новости', to: '/account?section=news', permission: 'news' },
  { id: 'portfolio', label: 'Портфолио', to: '/account?section=portfolio', permission: 'portfolio' },
  { id: 'promotions', label: 'Акции', to: '/account?section=promotions', permission: 'promotions' },
];

export function getAccountNavigation(user) {
  if (user?.role !== 'admin') return customerNavigation;
  if (!Array.isArray(user.permissions)) return adminNavigation;
  const permissions = new Set(user.permissions);
  return adminNavigation.reduce((items, item) => {
    if (item.children) {
      const children = item.children.filter((child) => permissions.has(child.permission));
      if (children.length) items.push({ ...item, children });
    } else if (permissions.has(item.permission)) {
      items.push(item);
    }
    return items;
  }, []);
}

export function resolveAdminSection(user, requestedSection) {
  if (user?.role !== 'admin') return null;
  const available = getAccountNavigation(user).flatMap((item) => item.children || [item]);
  return available.find((item) => item.id === requestedSection)?.id || available[0]?.id || null;
}

export function getAdminSectionLabel(user, section) {
  return getAccountNavigation(user).flatMap((item) => item.children || [item]).find((item) => item.id === section)?.label || 'Дашборд';
}
