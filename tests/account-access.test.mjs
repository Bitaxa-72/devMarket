import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const browser = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseUrl = (process.env.DEVMARKET_TEST_URL || 'http://127.0.0.1:5174').replace(/\/$/, '');

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function openBrowser() {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-account-access-'));
  const port = await availablePort();
  const child = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--window-size=1440,900', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      target = targets.find((item) => item.type === 'page');
      if (target) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(target, 'browser page did not start');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
      return;
    }
    listeners.get(message.method)?.forEach((listener) => listener(message.params));
  });
  const send = (method, params = {}) => new Promise((resolve) => {
    id += 1;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(response.result?.exceptionDetails, undefined, response.result?.exceptionDetails?.exception?.description);
    return response.result.result.value;
  };
  const waitFor = async (expression) => {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.fail(`Timed out: ${expression}`);
  };
  const on = (method, listener) => {
    const values = listeners.get(method) || [];
    values.push(listener);
    listeners.set(method, values);
  };
  const close = async () => {
    socket.close();
    child.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  };
  return { close, evaluate, on, send, waitFor };
}

test('authorized account uses the session user in a compact full-width workspace header', async () => {
  const page = await openBrowser();
  try {
    page.on('Fetch.requestPaused', async ({ request, requestId }) => {
      const isLogout = request.url.includes('/api/v1/auth/logout');
      const body = isLogout
        ? JSON.stringify({ message: 'Вы вышли из аккаунта' })
        : JSON.stringify({ user: { id: '1', email: 'vitaly.butenev@gmail.com', firstName: 'Виталий', lastName: 'Бутенев', role: 'admin', emailVerified: true } });
      await page.send('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(body).toString('base64') });
    });
    await page.send('Fetch.enable', { patterns: [{ urlPattern: '*api/v1/auth/me' }, { urlPattern: '*api/v1/auth/logout' }] });
    await page.send('Page.navigate', { url: `${baseUrl}/account` });
    await page.waitFor(`Boolean(document.querySelector('.account-workspace'))`);
    const state = await page.evaluate(`(() => {
      const workspace = document.querySelector('.account-page__container').getBoundingClientRect();
      const content = document.querySelector('.account-page__content').getBoundingClientRect();
      return {
        title: document.querySelector('.account-site__title')?.textContent.trim(),
        profileName: document.querySelector('.account-user__name')?.textContent.trim(),
        profileRole: document.querySelector('.account-user__role')?.textContent.trim(),
        initials: document.querySelector('.account-user__avatar')?.textContent.trim(),
        balance: document.querySelector('.account-balance strong')?.textContent.trim(),
        breadcrumbs: Boolean(document.querySelector('.page-hero__breadcrumbs')),
        pageHero: Boolean(document.querySelector('.page-hero')),
        sidebarLogout: Boolean(document.querySelector('.account-page__sidebar .account-site__logout')),
        headerLogout: Boolean(document.querySelector('.account-site__header .account-site__logout')),
        workspaceWidth: workspace.width,
        contentWidth: content.width,
        viewportWidth: innerWidth,
      };
    })()`);
    assert.equal(state.title, 'Здравствуйте, Виталий');
    assert.equal(state.profileName, 'Виталий Бутенев');
    assert.equal(state.profileRole, 'Администратор');
    assert.equal(state.initials, 'ВБ');
    assert.equal(state.balance, '32 500 ₽');
    assert.equal(state.breadcrumbs, false);
    assert.equal(state.pageHero, false);
    assert.equal(state.sidebarLogout, false);
    assert.equal(state.headerLogout, true);
    assert.ok(state.workspaceWidth >= state.viewportWidth - 64, JSON.stringify(state));
    assert.ok(state.contentWidth > 900, JSON.stringify(state));
    await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    const mobile = await page.evaluate(`(() => ({
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      headerRight: document.querySelector('.account-site__header-container').getBoundingClientRect().right,
      sidebarDisplay: getComputedStyle(document.querySelector('.account-page__sidebar')).display,
      sidebarOverflow: getComputedStyle(document.querySelector('.account-page__sidebar')).overflowX,
      titleVisible: Boolean(document.querySelector('.account-site__title').getClientRects().length),
      roleVisible: Boolean(document.querySelector('.account-user__role').getClientRects().length),
    }))()`);
    assert.equal(mobile.documentWidth, mobile.viewportWidth, JSON.stringify(mobile));
    assert.ok(mobile.headerRight <= mobile.viewportWidth, JSON.stringify(mobile));
    assert.equal(mobile.sidebarDisplay, 'flex');
    assert.equal(mobile.sidebarOverflow, 'auto');
    assert.equal(mobile.titleVisible, true);
    assert.equal(mobile.roleVisible, false);
    await page.evaluate(`document.querySelector('.account-site__logout').click()`);
    await page.waitFor(`location.pathname === '/' && location.search === ''`);
  } finally {
    await page.close();
  }
});

test('unauthorized account access opens the public home login modal without an account login page', async () => {
  const page = await openBrowser();
  try {
    page.on('Fetch.requestPaused', async ({ requestId }) => {
      const body = JSON.stringify({ message: 'Требуется вход' });
      await page.send('Fetch.fulfillRequest', { requestId, responseCode: 401, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(body).toString('base64') });
    });
    await page.send('Fetch.enable', { patterns: [{ urlPattern: '*api/v1/auth/me' }] });
    await page.send('Page.navigate', { url: `${baseUrl}/account/payment` });
    await page.waitFor(`location.pathname === '/' && new URLSearchParams(location.search).get('auth') === 'login'`);
    await page.waitFor(`document.querySelector('.auth-modal__title')?.textContent.trim() === 'Вход'`);
    assert.equal(await page.evaluate(`Boolean(document.querySelector('.account-site'))`), false);
  } finally {
    await page.close();
  }
});
