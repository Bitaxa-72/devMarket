import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const headerSource = readFileSync(new URL('../src/components/Header.jsx', import.meta.url), 'utf8');
const accountLayoutUrl = new URL('../src/components/AccountLayout.jsx', import.meta.url);
const accountLayoutSource = existsSync(accountLayoutUrl) ? readFileSync(accountLayoutUrl, 'utf8') : '';
const accountPagesSource = readFileSync(new URL('../src/pages/AccountPages.jsx', import.meta.url), 'utf8');
const commercePagesSource = readFileSync(new URL('../src/pages/CommercePages.jsx', import.meta.url), 'utf8');
const authPagesSource = readFileSync(new URL('../src/pages/AuthPages.jsx', import.meta.url), 'utf8');

test('account hostname uses an isolated account route tree', () => {
  assert.match(appSource, /isAccountHost\(window\.location\.hostname\)/);
  assert.match(appSource, /function AccountRoutes\(\)/);
  assert.match(appSource, /<AccountLayout \/>/);
  assert.match(appSource, /<Navigate replace to="\/account" \/>/);
});

test('public authentication stays on the main website', () => {
  assert.match(headerSource, /to="\/login"/);
  assert.match(appSource, /path="login" element=\{<LoginPage \/>\}/);
  assert.match(appSource, /path="register" element=\{<RegisterPage \/>\}/);
});

test('successful login continues on the account subdomain', () => {
  assert.match(authPagesSource, /window\.location\.assign\(getAccountUrl\('\/account'\)\)/);
});

test('home navigation is rendered before the catalog', () => {
  assert.match(headerSource, /to="\/"[^>]*>Главная<\/NavLink>[\s\S]*className="header__catalog"/);
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
