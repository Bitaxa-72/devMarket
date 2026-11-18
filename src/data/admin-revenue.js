const dayMilliseconds = 24 * 60 * 60 * 1000;
const hourlyValues = [500, 700, 900, 1200, 1000, 900, 1100, 700];
const hourlyLabels = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'];

function dateKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && dateKey(timestamp) === value ? timestamp : null;
}

function dailyLabel(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function getRevenueView(period, start = '', end = '', now = new Date()) {
  const current = new Date(now);
  const today = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  const samples = Array.from({ length: 90 }, (_, age) => ({
    date: dateKey(today - age * dayMilliseconds),
    value: 7000 + ((age * 7) % 13) * 950,
  })).reverse();

  if (period === 'day') {
    return {
      total: 7000,
      points: hourlyValues.map((value, index) => ({ label: hourlyLabels[index], value })),
      dayCount: 1,
      activeDays: 1,
      interval: 'По часам',
    };
  }

  let selected = [];
  if (period === 'range') {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    if (startDate !== null && endDate !== null && startDate <= endDate) {
      selected = samples.filter((sample) => sample.date >= start && sample.date <= end);
    }
  } else {
    const days = { week: 7, month: 30, quarter: 90 }[period] || 7;
    selected = samples.slice(-days);
  }

  const total = selected.reduce((sum, sample) => sum + sample.value, 0);
  const groupSize = selected.length > 31 ? 7 : 1;
  const points = [];
  for (let index = 0; index < selected.length; index += groupSize) {
    const group = selected.slice(index, index + groupSize);
    points.push({ label: dailyLabel(group[group.length - 1].date), value: group.reduce((sum, sample) => sum + sample.value, 0) });
  }

  return { total, points, dayCount: selected.length, activeDays: selected.filter((sample) => sample.value > 0).length, interval: groupSize === 1 ? 'По дням' : 'По неделям' };
}
