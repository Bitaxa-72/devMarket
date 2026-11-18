import assert from 'node:assert/strict';
import test from 'node:test';
import { getRevenueView } from '../src/data/admin-revenue.js';

const referenceDate = new Date('2026-11-18T12:00:00Z');

test('daily and weekly illustrative totals are absolute values of the visible periods', () => {
  const day = getRevenueView('day', '', '', referenceDate);
  const week = getRevenueView('week', '', '', referenceDate);
  assert.equal(day.total, 7000);
  assert.equal(day.points.reduce((sum, point) => sum + point.value, 0), 7000);
  assert.equal(week.total, 77500);
  assert.equal(week.points.length, 7);
});

test('a custom two-day range sums only selected dates', () => {
  const range = getRevenueView('range', '2026-11-17', '2026-11-18', referenceDate);
  assert.equal(range.total, 20650);
  assert.equal(range.points.length, 2);
});

test('invalid or reversed date ranges show no fabricated revenue', () => {
  assert.equal(getRevenueView('range', '2026-11-19', '2026-11-18', referenceDate).total, 0);
  assert.equal(getRevenueView('range', 'bad-date', '2026-11-18', referenceDate).points.length, 0);
});
