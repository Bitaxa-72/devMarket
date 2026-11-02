export const accountBalance = '32 500 ₽';

export const orderStatuses = [
  { id: 'done', label: 'Завершён' },
  { id: 'progress', label: 'В работе' },
  { id: 'support', label: 'Техсопровождение' },
];

export const accountOrders = [
  {
    id: 'DM-1042',
    title: 'Telegram-бот с платным контентом',
    createdAt: '24 сентября 2026',
    status: 'progress',
    price: '49 000 ₽',
    paymentStatus: 'Оплачен',
    paymentTone: 'paid',
    summary: 'Запуск Telegram-бота для продажи подписки и автоматической выдачи материалов.',
    specification: ['Авторизация пользователя в Telegram', 'Приём оплаты за подписку', 'Автоматическая выдача материалов', 'Уведомления владельцу о новых оплатах'],
    attachments: ['Техническое задание.pdf', 'Сценарии бота.docx'],
  },
  {
    id: 'DM-0971',
    title: 'Аудит сайта и аналитики',
    createdAt: '12 августа 2026',
    status: 'done',
    price: '25 000 ₽',
    paymentStatus: 'Оплачен',
    paymentTone: 'paid',
    summary: 'Аудит пользовательских сценариев, аналитики и технического состояния сайта.',
    specification: ['Проверка ключевых сценариев', 'Аудит событий аналитики', 'Список ошибок и приоритетов'],
    attachments: ['Итоговый аудит.pdf', 'План улучшений.xlsx'],
  },
  {
    id: 'DM-0884',
    title: 'Техническое сопровождение CRM',
    createdAt: '3 июля 2026',
    status: 'support',
    price: '45 000 ₽/мес',
    paymentStatus: 'Ожидает оплаты',
    paymentTone: 'waiting',
    summary: 'Ежемесячная поддержка CRM, контроль стабильности и выпуск обновлений.',
    specification: ['Мониторинг работоспособности', 'Исправление ошибок', 'Плановые обновления и отчёт'],
    attachments: ['Регламент поддержки.pdf'],
  },
];

export function getAccountOrder(orderId) {
  return accountOrders.find((order) => order.id === orderId);
}
