import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const authSource = readFileSync(new URL('../src/pages/AuthPages.jsx', import.meta.url), 'utf8');
const accountShellSource = readFileSync(new URL('../src/components/AccountShell.jsx', import.meta.url), 'utf8');

test('authentication routes and protected account entry are wired', () => {
  for (const route of ['login', 'register', 'forgot-password', 'reset-password', 'verify-email']) {
    assert.match(appSource, new RegExp(`path="${route}"`));
  }
  assert.match(appSource, /<RequireAuth><AccountPage \/><\/RequireAuth>/);
});

test('forms call the backend and expose password-manager hints', () => {
  assert.match(authSource, /authRequest\('\/login'/);
  assert.match(authSource, /authRequest\('\/register'/);
  assert.match(authSource, /authRequest\('\/forgot-password'/);
  assert.match(authSource, /authRequest\('\/reset-password'/);
  assert.match(authSource, /autoComplete="current-password"/);
  assert.match(authSource, /autoComplete="new-password"/);
  assert.match(authSource, /Сгенерировать/);
  assert.match(accountShellSource, /authRequest\('\/logout'/);
});
