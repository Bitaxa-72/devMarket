import assert from 'node:assert/strict';
import test from 'node:test';
import { getAccountNavigation, resolveAdminSection } from '../src/lib/account-navigation.js';

test('customer navigation excludes every administrative destination', () => {
  const items = getAccountNavigation({ role: 'customer' });
  assert.deepEqual(items.map((item) => item.id), ['orders', 'payment', 'profile', 'security', 'chat']);
});

test('admin navigation exposes the agreed sections and store children', () => {
  const items = getAccountNavigation({ role: 'admin' });
  assert.deepEqual(items.map((item) => item.id), ['dashboard', 'store', 'tracker', 'users', 'chat', 'news', 'portfolio', 'promotions']);
  assert.deepEqual(items[1].children.map((item) => item.id), ['store-orders', 'store-catalog', 'store-services']);
});

test('limited admin cannot select an absent section through the URL', () => {
  const user = { role: 'admin', permissions: ['dashboard', 'news'] };
  assert.deepEqual(getAccountNavigation(user).map((item) => item.id), ['dashboard', 'news']);
  assert.equal(resolveAdminSection(user, 'users'), 'dashboard');
  assert.equal(resolveAdminSection(user, 'news'), 'news');
});
