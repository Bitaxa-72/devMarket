import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const headerSource = readFileSync(new URL('../src/components/Header.jsx', import.meta.url), 'utf8');
const accountLayoutUrl = new URL('../src/components/AccountLayout.jsx', import.meta.url);
const accountLayoutSource = existsSync(accountLayoutUrl) ? readFileSync(accountLayoutUrl, 'utf8') : '';
const accountPagesSource = readFileSync(new URL('../src/pages/AccountPages.jsx', import.meta.url), 'utf8');
const commercePagesSource = readFileSync(new URL('../src/pages/CommercePages.jsx', import.meta.url), 'utf8');

test('account hostname uses an isolated account route tree', () => {
  assert.match(appSource, /isAccountHost\(window\.location\.hostname\)/);
  assert.match(appSource, /function AccountRoutes\(\)/);
  assert.match(appSource, /<AccountLayout \/>/);
  assert.match(appSource, /<Navigate replace to="\/account" \/>/);
});

test('public login opens the account domain in a new tab', () => {
  assert.match(headerSource, /href=\{getAccountUrl\('\/login'\)\}/);
  assert.match(headerSource, /target="_blank"/);
  assert.match(headerSource, /rel="noreferrer"/);
});

test('account layout links back to the public website', () => {
  assert.match(accountLayoutSource, /getPublicSiteUrl\(\)/);
  assert.match(accountLayoutSource, /На основной сайт/);
  assert.match(accountLayoutSource, /<Outlet \/>/);
});

test('cross-domain actions use absolute site URLs', () => {
  assert.match(accountPagesSource, /getPublicSiteUrl\('\/catalog'\)/);
  assert.match(commercePagesSource, /getAccountUrl\('\/account'\)/);
});
