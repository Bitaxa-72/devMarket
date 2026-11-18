import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const browser = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseUrl = (process.env.DEVMARKET_TEST_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
const expectedAccountHost = new URL(baseUrl).hostname === '127.0.0.1' ? '127.0.0.1' : 'lk.testvitalydomen.ru';

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

async function openBrowser(url) {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-auth-modal-'));
  const port = await availablePort();
  const child = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, url], { stdio: 'ignore' });
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
  const eventListeners = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
      return;
    }
    eventListeners.get(message.method)?.forEach((listener) => listener(message.params));
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
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.fail(`Timed out: ${expression}`);
  };
  const click = async (selector) => {
    const point = await evaluate(`(() => { const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  };
  const close = async () => {
    socket.close();
    child.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  };
  const listPages = async () => fetch(`http://127.0.0.1:${port}/json/list`)
    .then((response) => response.json())
    .then((targets) => targets.filter((item) => item.type === 'page'));
  const on = (method, listener) => {
    const listeners = eventListeners.get(method) || [];
    listeners.push(listener);
    eventListeners.set(method, listeners);
  };
  return { click, close, evaluate, listPages, on, send, waitFor };
}

test('anonymous account control opens all authentication modes in one modal', async () => {
  const page = await openBrowser(`${baseUrl}/`);
  try {
    await page.waitFor(`document.querySelector('.header__login')?.textContent.includes('Войти') && !document.querySelector('.header__login').disabled`);
    assert.equal(await page.evaluate(`document.querySelector('.header__login').tagName`), 'BUTTON');
    const headerBeforeModal = await page.evaluate(`(() => { const rect = document.querySelector('.header__container').getBoundingClientRect(); return { left: rect.left, right: rect.right }; })()`);
    await page.evaluate(`document.querySelector('.header__login').click()`);
    await page.waitFor(`Boolean(document.querySelector('.auth-modal [aria-modal="true"]'))`);
    const headerWithModal = await page.evaluate(`(() => { const rect = document.querySelector('.header__container').getBoundingClientRect(); return { left: rect.left, right: rect.right }; })()`);
    assert.ok(Math.abs(headerBeforeModal.left - headerWithModal.left) <= 1, JSON.stringify({ headerBeforeModal, headerWithModal }));
    assert.ok(Math.abs(headerBeforeModal.right - headerWithModal.right) <= 1, JSON.stringify({ headerBeforeModal, headerWithModal }));
    assert.equal(await page.evaluate(`location.pathname`), '/');
    assert.equal(await page.evaluate(`document.querySelector('.auth-modal__title').textContent.trim()`), 'Вход');
    await page.evaluate(`document.querySelector('[data-auth-mode="register"]').click()`);
    assert.equal(await page.evaluate(`document.querySelector('.auth-modal__title').textContent.trim()`), 'Регистрация');
    assert.equal(await page.evaluate(`Boolean(document.querySelector('input[name="confirmation"]'))`), true);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const desktopDialog = await page.evaluate(`(() => {
      const dialog = document.querySelector('.auth-modal__dialog');
      const controls = document.querySelector('.auth-modal__controls')?.getBoundingClientRect();
      const tabs = document.querySelector('.auth-modal__tabs').getBoundingClientRect();
      const close = document.querySelector('.auth-modal__close').getBoundingClientRect();
      return {
        clientHeight: dialog.clientHeight,
        scrollHeight: dialog.scrollHeight,
        controlsTop: controls?.top,
        tabsTop: tabs.top,
        tabsHeight: tabs.height,
        closeTop: close.top,
        closeHeight: close.height,
        controlsRight: controls?.right,
        closeRight: close.right,
      };
    })()`);
    assert.ok(desktopDialog.scrollHeight <= desktopDialog.clientHeight + 1, JSON.stringify(desktopDialog));
    assert.ok(Math.abs(desktopDialog.tabsTop - desktopDialog.closeTop) <= 1, JSON.stringify(desktopDialog));
    assert.ok(Math.abs(desktopDialog.tabsHeight - desktopDialog.closeHeight) <= 1, JSON.stringify(desktopDialog));
    assert.ok(Math.abs(desktopDialog.controlsRight - desktopDialog.closeRight) <= 1, JSON.stringify(desktopDialog));
    await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 667, deviceScaleFactor: 1, mobile: true });
    const mobileDialog = await page.evaluate(`(() => { const dialog = document.querySelector('.auth-modal__dialog'); const rect = dialog.getBoundingClientRect(); return { bottom: rect.bottom, left: rect.left, right: rect.right, overflowY: getComputedStyle(dialog).overflowY, pageWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, tabRight: document.querySelector('.auth-modal__tabs').getBoundingClientRect().right, closeRight: document.querySelector('.auth-modal__close').getBoundingClientRect().right, inputRight: document.querySelector('.auth-modal input:not([name="website"])').getBoundingClientRect().right }; })()`);
    assert.ok(mobileDialog.left < 1 && mobileDialog.right <= 390 && mobileDialog.bottom <= 667);
    assert.equal(mobileDialog.overflowY, 'auto');
    assert.equal(mobileDialog.pageWidth, 390);
    assert.ok(Math.max(mobileDialog.tabRight, mobileDialog.closeRight, mobileDialog.inputRight) <= mobileDialog.viewportWidth + 1, JSON.stringify(mobileDialog));
    await page.evaluate(`document.querySelector('[data-auth-mode="login"]').click()`);
    await page.waitFor(`document.querySelector('.auth-modal__title')?.textContent.trim() === 'Вход'`);
    await page.evaluate(`document.querySelector('[data-auth-mode="forgot"]').click()`);
    assert.equal(await page.evaluate(`document.querySelector('.auth-modal__title').textContent.trim()`), 'Восстановление доступа');
    assert.equal(await page.evaluate(`document.querySelectorAll('.auth-modal input:not([name="website"])').length`), 1);
    const recoveryControls = await page.evaluate(`(() => {
      const back = document.querySelector('.auth-modal__back').getBoundingClientRect();
      const close = document.querySelector('.auth-modal__close').getBoundingClientRect();
      return { backHeight: back.height, closeHeight: close.height, topDifference: Math.abs(back.top - close.top) };
    })()`);
    assert.ok(recoveryControls.backHeight >= 44, JSON.stringify(recoveryControls));
    assert.ok(Math.abs(recoveryControls.backHeight - recoveryControls.closeHeight) <= 1, JSON.stringify(recoveryControls));
    assert.ok(recoveryControls.topDifference <= 1, JSON.stringify(recoveryControls));
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    await page.waitFor(`!document.querySelector('.auth-modal')`);
    await page.send('Page.navigate', { url: `${baseUrl}/register` });
    await page.waitFor(`document.querySelector('.auth-modal__title')?.textContent.trim() === 'Регистрация'`);
    assert.equal(await page.evaluate(`location.pathname + location.search`), '/?auth=register');
    await page.send('Page.navigate', { url: `${baseUrl}/reset-password?token=reset-token` });
    await page.waitFor(`document.querySelector('.auth-modal__title')?.textContent.trim() === 'Новый пароль'`);
    assert.equal(await page.evaluate(`location.pathname + location.search`), '/?token=reset-token&auth=reset');
    assert.equal(await page.evaluate(`Boolean(document.querySelector('.hero-slider'))`), true);
    assert.equal(await page.evaluate(`document.querySelectorAll('.auth-modal input[type="password"]').length`), 2);
  } finally {
    await page.close();
  }
});

test('authorized account control shows email, cabinet action and logout', async () => {
  const page = await openBrowser('about:blank');
  try {
    page.on('Fetch.requestPaused', async ({ request, requestId }) => {
      const isLogout = request.url.includes('/api/v1/auth/logout');
      const body = isLogout
        ? JSON.stringify({ message: 'Вы вышли из аккаунта' })
        : JSON.stringify({ user: { id: '1', email: 'client@example.com', firstName: 'Виталий', lastName: null, role: 'customer', emailVerified: true } });
      await page.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
        body: Buffer.from(body).toString('base64'),
      });
    });
    await page.send('Fetch.enable', { patterns: [{ urlPattern: '*api/v1/auth/me' }, { urlPattern: '*api/v1/auth/logout' }] });
    await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 667, deviceScaleFactor: 1, mobile: true });
    await page.send('Page.navigate', { url: `${baseUrl}/` });
    await page.waitFor(`document.querySelector('.header__mobile-login')?.textContent.includes('client@example.com')`);
    await page.evaluate(`document.querySelector('.header__mobile-login').click()`);
    await page.waitFor(`Boolean(document.querySelector('.header__account-menu'))`);
    const menu = await page.evaluate(`({
      labels: [...document.querySelectorAll('.header__account-menu a, .header__account-menu button')].map((item) => item.textContent.trim()),
      cabinetHost: new URL(document.querySelector('.header__account-menu a').href).hostname,
      cabinetTarget: document.querySelector('.header__account-menu a').target,
      menuRight: document.querySelector('.header__account-menu').getBoundingClientRect().right,
      triggerRight: document.querySelector('.header__mobile-login').getBoundingClientRect().right
    })`);
    assert.deepEqual(menu.labels, ['Личный кабинет', 'Выйти']);
    assert.equal(menu.cabinetHost, expectedAccountHost);
    assert.equal(menu.cabinetTarget, '_blank');
    assert.ok(menu.menuRight <= 390 && menu.triggerRight <= 390);
    await page.evaluate(`document.querySelector('.header__account-menu button').click()`);
    await page.waitFor(`document.querySelector('.header__mobile-login')?.textContent.includes('Войти')`);
  } finally {
    await page.close();
  }
});

test('successful login opens the account in a new browser tab without a second click', async () => {
  const page = await openBrowser('about:blank');
  try {
    page.on('Fetch.requestPaused', async ({ request, requestId }) => {
      const isLogin = request.url.includes('/api/v1/auth/login');
      const responseHeaders = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: new URL(baseUrl).origin },
        { name: 'Access-Control-Allow-Credentials', value: 'true' },
        { name: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        { name: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
      ];
      if (request.method === 'OPTIONS') {
        await page.send('Fetch.fulfillRequest', { requestId, responseCode: 204, responseHeaders });
        return;
      }
      const body = isLogin
        ? JSON.stringify({ user: { id: '1', email: 'client@example.com', firstName: 'Виталий', lastName: null, role: 'customer', emailVerified: true } })
        : JSON.stringify({ message: 'Требуется вход' });
      await page.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: isLogin ? 200 : 401,
        responseHeaders,
        body: Buffer.from(body).toString('base64'),
      });
    });
    await page.send('Fetch.enable', { patterns: [{ urlPattern: '*api/v1/auth/me' }, { urlPattern: '*api/v1/auth/login' }] });
    await page.send('Page.navigate', { url: `${baseUrl}/` });
    await page.waitFor(`document.querySelector('.header__login')?.textContent.includes('Войти') && !document.querySelector('.header__login').disabled`);
    await page.evaluate(`window.turnstile = { render: (_container, options) => { queueMicrotask(() => options.callback('test-turnstile-token')); return 1; }, remove: () => {} }`);
    const initialPageCount = (await page.listPages()).filter(({ url }) => /^https?:/.test(url)).length;
    await page.evaluate(`document.querySelector('.header__login').click()`);
    await page.waitFor(`Boolean(document.querySelector('.auth-modal__dialog'))`);
    await page.evaluate(`(() => {
      const setValue = (selector, value) => {
        const input = document.querySelector(selector);
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setValue('input[name="email"]', 'client@example.com');
      setValue('input[name="password"]', 'Reliable password 7!');
    })()`);
    await page.waitFor(`!document.querySelector('.auth-form__submit').disabled`);
    await page.click('.auth-form__submit');
    await page.waitFor(`document.querySelector('.header__login')?.textContent.includes('client@example.com')`);
    let pages = [];
    for (let attempt = 0; attempt < 60; attempt += 1) {
      pages = await page.listPages();
      if (pages.filter(({ url }) => /^https?:/.test(url)).length === initialPageCount + 1) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const httpPages = pages.filter(({ url }) => /^https?:/.test(url));
    assert.equal(httpPages.length, initialPageCount + 1, JSON.stringify(pages.map(({ title, url }) => ({ title, url }))));
  } finally {
    await page.close();
  }
});
