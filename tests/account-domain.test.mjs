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
const siteLayoutSource = readFileSync(new URL('../src/components/SiteLayout.jsx', import.meta.url), 'utf8');
const sessionLinkSource = readFileSync(new URL('../src/components/SessionAccountLink.jsx', import.meta.url), 'utf8');

test('account hostname uses an isolated account route tree', () => {
  assert.match(appSource, /isAccountHost\(window\.location\.hostname\)/);
  assert.match(appSource, /function AccountRoutes\(\)/);
  assert.match(appSource, /<AccountLayout \/>/);
  assert.match(appSource, /<Navigate replace to="\/account" \/>/);
});

test('public authentication stays on the main website', () => {
  assert.match(sessionLinkSource, /to="\/login"/);
  assert.match(appSource, /path="login" element=\{<LoginPage \/>\}/);
  assert.match(appSource, /path="register" element=\{<RegisterPage \/>\}/);
});

test('public header reflects the shared authenticated session', () => {
  assert.match(siteLayoutSource, /authRequest\('\/me'\)/);
  assert.match(headerSource, /<SessionAccountLink/);
  assert.match(sessionLinkSource, /getAccountUrl\('\/account'\)/);
  assert.match(sessionLinkSource, /target="_blank"/);
  assert.match(sessionLinkSource, /Личный кабинет/);
});

test('authenticated visitors do not see login or registration forms', () => {
  assert.match(authPagesSource, /function AuthEntryGate/);
  assert.match(authPagesSource, /Вы уже вошли/);
  assert.match(authPagesSource, /Открыть личный кабинет/);
});

test('password reset without a token does not render password fields', () => {
  assert.match(authPagesSource, /if \(!token\) return <InvalidResetLink/);
  assert.match(authPagesSource, /Запросить новую ссылку/);
});

test('authentication redirects preserve email token query parameters', () => {
  assert.match(appSource, /getPublicSiteUrl\(`\$\{path\}\$\{window\.location\.search\}`\)/);
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
