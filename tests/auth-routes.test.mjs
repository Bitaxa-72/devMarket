import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const authModalSource = readFileSync(new URL('../src/components/AuthModal.jsx', import.meta.url), 'utf8');
const accountShellSource = readFileSync(new URL('../src/components/AccountShell.jsx', import.meta.url), 'utf8');

test('authentication routes and protected account entry are wired', () => {
  for (const route of ['login', 'register', 'forgot-password', 'reset-password', 'verify-email']) {
    assert.match(appSource, new RegExp(`path="${route}"`));
  }
  assert.match(appSource, /<RequireAuth><AccountPage \/><\/RequireAuth>/);
});

test('forms call the backend and expose password-manager hints', () => {
  assert.match(authModalSource, /authRequest\('\/login'/);
  assert.match(authModalSource, /authRequest\('\/register'/);
  assert.match(authModalSource, /authRequest\('\/forgot-password'/);
  assert.match(authModalSource, /authRequest\('\/reset-password'/);
  assert.match(authModalSource, /autoComplete="current-password"/);
  assert.match(authModalSource, /autoComplete="new-password"/);
  assert.match(authModalSource, /Создать аккаунт/);
  assert.match(accountShellSource, /authRequest\('\/logout'/);
});
