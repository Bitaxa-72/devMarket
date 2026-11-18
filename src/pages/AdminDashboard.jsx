import { useState } from 'react';
import { getRevenueView } from '../data/admin-revenue';

const periods = [
  { id: 'day', label: 'Сутки' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'range', label: 'Выбрать даты' },
];

const formatAmount = (amount) => `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;

function RevenueChart({ points }) {
  if (!points.length) return <div className="admin-dashboard__chart-empty">Выберите даты в пределах последних 90 дней, чтобы увидеть график.</div>;

  const maximum = Math.max(...points.map((point) => point.value), 1);
  const coordinates = points.map((point, index) => ({
    x: 44 + (points.length === 1 ? 0 : index * 872 / (points.length - 1)),
    y: 205 - point.value / maximum * 158,
  }));
  const line = coordinates.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const fill = `${line} L ${coordinates[coordinates.length - 1].x} 205 L 44 205 Z`;

  return <div className="admin-dashboard__chart" role="img" aria-label="Демонстрационная динамика выручки">
    <svg viewBox="0 0 960 230" preserveAspectRatio="none" aria-hidden="true">
      <path className="admin-dashboard__gridline" d="M 44 47 H 916 M 44 126 H 916 M 44 205 H 916" />
      <path className="admin-dashboard__area" d={fill} />
      <path className="admin-dashboard__line" d={line} />
      {coordinates.map((point, index) => <circle className="admin-dashboard__point" cx={point.x} cy={point.y} r="3" key={`${points[index].label}-${index}`} />)}
    </svg>
    <div className="admin-dashboard__axis"><span>{points[0].label}</span><span>{points[Math.floor((points.length - 1) / 2)].label}</span><span>{points[points.length - 1].label}</span></div>
  </div>;
}

export function AdminDashboard() {
  const [period, setPeriod] = useState('day');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const revenue = getRevenueView(period, start, end);

  return <section className="admin-dashboard">
    <div className="admin-dashboard__heading"><div><h2>Выручка</h2><p>Обзор поступлений за выбранный период</p></div><span className="admin-dashboard__notice">Демонстрационные данные</span></div>
    <div className="admin-dashboard__filters" aria-label="Период выручки">{periods.map((item) => <button className={period === item.id ? 'admin-dashboard__period admin-dashboard__period--active' : 'admin-dashboard__period'} data-period={item.id} aria-pressed={period === item.id} onClick={() => setPeriod(item.id)} type="button" key={item.id}>{item.label}</button>)}</div>
    {period === 'range' && <div className="admin-dashboard__dates"><label>С <input className="admin-dashboard__date" type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label><label>По <input className="admin-dashboard__date" type="date" min={start || undefined} value={end} onChange={(event) => setEnd(event.target.value)} /></label></div>}
    <div className="admin-dashboard__summary"><div className="admin-dashboard__primary"><span>Выручка за период</span><strong className="admin-dashboard__total">{formatAmount(revenue.total)}</strong></div><div className="admin-dashboard__metric"><span>Среднее за день</span><strong>{formatAmount(revenue.dayCount ? Math.round(revenue.total / revenue.dayCount) : 0)}</strong></div><div className="admin-dashboard__metric"><span>Дней с поступлениями</span><strong>{revenue.activeDays}</strong></div></div>
    <div className="admin-dashboard__chart-heading"><h3>Динамика выручки</h3><span>{revenue.interval}</span></div>
    <RevenueChart points={revenue.points} />
    <p className="admin-dashboard__footnote">Показатели служат примером оформления. Финансовые данные появятся после подключения заказов и платежей.</p>
  </section>;
}
