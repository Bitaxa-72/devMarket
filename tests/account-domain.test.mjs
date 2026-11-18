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
const sessionControlSource = readFileSync(new URL('../src/components/SessionAccountControl.jsx', import.meta.url), 'utf8');
const authModalSource = readFileSync(new URL('../src/components/AuthModal.jsx', import.meta.url), 'utf8');

test('account hostname uses an isolated account route tree', () => {
  assert.match(appSource, /isAccountHost\(window\.location\.hostname\)/);
  assert.match(appSource, /function AccountRoutes\(\)/);
  assert.match(appSource, /<AccountLayout \/>/);
  assert.match(appSource, /<Navigate replace to="\/account" \/>/);
});

test('legacy authentication URLs open modal modes on the main website', () => {
  assert.match(appSource, /path="login" element=\{<Navigate replace to="\/\?auth=login" \/>\}/);
  assert.match(appSource, /path="register" element=\{<Navigate replace to="\/\?auth=register" \/>\}/);
  assert.match(appSource, /path="forgot-password" element=\{<Navigate replace to="\/\?auth=forgot" \/>\}/);
});

test('public header reflects the shared authenticated session', () => {
  assert.match(siteLayoutSource, /authRequest\('\/me'\)/);
  assert.match(headerSource, /<SessionAccountControl/);
  assert.match(sessionControlSource, /getAccountUrl\('\/account'\)/);
  assert.match(sessionControlSource, /target="_blank"/);
  assert.match(sessionControlSource, /session\.user\.email/);
});

test('authentication actions share one modal', () => {
  assert.match(authModalSource, /function LoginForm/);
  assert.match(authModalSource, /function RegisterForm/);
  assert.match(authModalSource, /function ForgotPasswordForm/);
  assert.match(siteLayoutSource, /<AuthModal/);
});

test('password reset without a token does not render password fields', () => {
  assert.match(authPagesSource, /if \(!token\) return <InvalidResetLink/);
  assert.match(authPagesSource, /Запросить новую ссылку/);
});

test('authentication redirects preserve email token query parameters', () => {
  assert.match(appSource, /getPublicSiteUrl\(`\$\{path\}\$\{window\.location\.search\}`\)/);
});

test('successful modal login updates the shared session on the public site', () => {
  assert.match(authModalSource, /onAuthenticated\(response\.user\)/);
  assert.match(siteLayoutSource, /setAuthSession\(\{ status: 'authorized', user \}\)/);
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
