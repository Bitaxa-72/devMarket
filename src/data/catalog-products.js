import { Bot, Braces, Globe2, MonitorSmartphone, PlugZap, SlidersHorizontal } from 'lucide-react';

export const catalogCategories = [
  {
    id: 'bots',
    title: 'Боты',
    description: 'Автоматизация диалогов и продаж',
    icon: Bot,
    products: [
      { title: 'Бот с платным контентом', description: 'Подписки, доступы и автоматическая выдача материалов.', leadTime: 'от 10 дней', price: 'от 49 000 ₽', accent: 'violet' },
      { title: 'Бот для продаж', description: 'Квиз, заявки, уведомления и передача сделок в CRM.', leadTime: 'от 7 дней', price: 'от 35 000 ₽', accent: 'blue' },
      { title: 'Бот поддержки', description: 'Ответы на вопросы, маршрутизация и личный кабинет.', leadTime: 'от 14 дней', price: 'от 59 000 ₽', accent: 'mint' },
      { title: 'Бот для записи', description: 'Слоты, напоминания и синхронизация с календарём.', leadTime: 'от 10 дней', price: 'от 45 000 ₽', accent: 'orange' },
      { title: 'AI-ассистент', description: 'Помощник на базе ваших материалов и сценариев.', leadTime: 'от 14 дней', price: 'от 79 000 ₽', accent: 'rose' },
    ],
  },
  {
    id: 'sites',
    title: 'Сайты',
    description: 'Лендинги, каталоги и магазины',
    icon: Globe2,
    products: [
      { title: 'Лендинг услуги', description: 'Страница для презентации услуги и сбора заявок.', leadTime: 'от 7 дней', price: 'от 39 000 ₽', accent: 'blue' },
      { title: 'Корпоративный сайт', description: 'Многостраничный сайт с понятной структурой и CMS.', leadTime: 'от 21 дня', price: 'от 110 000 ₽', accent: 'mint' },
      { title: 'Интернет-магазин', description: 'Каталог, оплата, личный кабинет и управление заказами.', leadTime: 'от 30 дней', price: 'от 180 000 ₽', accent: 'violet' },
      { title: 'Сайт мероприятия', description: 'Программа, билеты и коммуникация с участниками.', leadTime: 'от 14 дней', price: 'от 65 000 ₽', accent: 'orange' },
      { title: 'Промо-страница', description: 'Выразительная подача нового продукта или запуска.', leadTime: 'от 10 дней', price: 'от 52 000 ₽', accent: 'rose' },
    ],
  },
  {
    id: 'custom',
    title: 'Разработка под ключ',
    description: 'Сервис под ваш процесс',
    icon: SlidersHorizontal,
    products: [
      { title: 'MVP сервиса', description: 'Первая рабочая версия, чтобы проверить гипотезу.', leadTime: 'от 30 дней', price: 'от 250 000 ₽', accent: 'violet' },
      { title: 'Личный кабинет', description: 'Аккаунты, роли пользователей, данные и уведомления.', leadTime: 'от 21 дня', price: 'от 160 000 ₽', accent: 'blue' },
      { title: 'Платформа обучения', description: 'Курсы, задания, оплаты и прогресс учеников.', leadTime: 'от 45 дней', price: 'от 320 000 ₽', accent: 'mint' },
      { title: 'Внутренний сервис', description: 'Инструмент для команды без лишней ручной работы.', leadTime: 'от 30 дней', price: 'от 220 000 ₽', accent: 'orange' },
      { title: 'Продуктовая команда', description: 'Проектирование, разработка и запуск в одном процессе.', leadTime: 'по оценке', price: 'от 300 000 ₽', accent: 'rose' },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Клиенты, сделки и процессы',
    icon: MonitorSmartphone,
    products: [
      { title: 'CRM для отдела продаж', description: 'Воронка, задачи и прозрачная работа со сделками.', leadTime: 'от 21 дня', price: 'от 140 000 ₽', accent: 'mint' },
      { title: 'CRM для услуг', description: 'Клиенты, записи, оплаты и история коммуникаций.', leadTime: 'от 14 дней', price: 'от 95 000 ₽', accent: 'blue' },
      { title: 'CRM для агентства', description: 'Проекты, загрузка команды и контроль финансов.', leadTime: 'от 21 дня', price: 'от 160 000 ₽', accent: 'violet' },
      { title: 'CRM для обучения', description: 'Ученики, группы, платежи и сопровождение.', leadTime: 'от 21 дня', price: 'от 130 000 ₽', accent: 'orange' },
      { title: 'Настройка Bitrix24', description: 'Внедрение CRM под действующую команду и процессы.', leadTime: 'от 10 дней', price: 'от 55 000 ₽', accent: 'rose' },
    ],
  },
  {
    id: 'integrations',
    title: 'Интеграции',
    description: 'Связь сервисов и данных',
    icon: PlugZap,
    products: [
      { title: 'Интеграция с CRM', description: 'Передача заявок, статусов и контактов без ручной работы.', leadTime: 'от 5 дней', price: 'от 29 000 ₽', accent: 'orange' },
      { title: 'Платёжная интеграция', description: 'Оплата, чеки, подписки и статусы платежей.', leadTime: 'от 7 дней', price: 'от 45 000 ₽', accent: 'mint' },
      { title: 'Интеграция с Telegram', description: 'Уведомления, команды и сценарии общения с клиентом.', leadTime: 'от 5 дней', price: 'от 32 000 ₽', accent: 'blue' },
      { title: 'Интеграция с маркетплейсом', description: 'Остатки, цены, заказы и синхронизация товаров.', leadTime: 'от 14 дней', price: 'от 85 000 ₽', accent: 'violet' },
      { title: 'API для партнёров', description: 'Безопасный обмен данными между системами.', leadTime: 'от 14 дней', price: 'от 90 000 ₽', accent: 'rose' },
    ],
  },
  {
    id: 'apps',
    title: 'Приложения iOS / Android',
    description: 'Мобильный продукт для клиентов',
    icon: Braces,
    products: [
      { title: 'MVP приложения', description: 'Быстрый старт с ключевым сценарием для пользователей.', leadTime: 'от 45 дней', price: 'от 350 000 ₽', accent: 'blue' },
      { title: 'Приложение для сервиса', description: 'Заказы, уведомления, профиль и онлайн-оплата.', leadTime: 'от 60 дней', price: 'от 520 000 ₽', accent: 'mint' },
      { title: 'Приложение для лояльности', description: 'Баллы, предложения и персональные коммуникации.', leadTime: 'от 45 дней', price: 'от 390 000 ₽', accent: 'violet' },
      { title: 'Приложение для команды', description: 'Задачи, данные и рабочие процессы в одном месте.', leadTime: 'от 60 дней', price: 'от 480 000 ₽', accent: 'orange' },
      { title: 'Поддержка приложения', description: 'Развитие, обновления и стабильная работа после релиза.', leadTime: 'ежемесячно', price: 'от 80 000 ₽', accent: 'rose' },
    ],
  },
];
