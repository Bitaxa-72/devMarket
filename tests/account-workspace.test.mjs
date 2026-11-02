import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const browser = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

test('account orders support additive status filters and open a dedicated detail route', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-account-test-'));
  const port = await getAvailablePort();
  const browserProcess = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--window-size=1440,900', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'http://127.0.0.1:5173/account'], { stdio: 'ignore' });

  try {
    let target;
    for (let attempt = 0; attempt < 40; attempt += 1) {
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
    let commandId = 0;
    const pending = new Map();
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (!message.id || !pending.has(message.id)) return;
      pending.get(message.id)(message);
      pending.delete(message.id);
    });
    const send = (method, params = {}) => new Promise((resolve) => {
      commandId += 1;
      pending.set(commandId, resolve);
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });
    const evaluate = async (expression) => {
      const response = await send('Runtime.evaluate', { expression, returnByValue: true });
      return response.result.result.value;
    };

    await send('Page.navigate', { url: 'http://127.0.0.1:5173/account' });
    await new Promise((resolve) => setTimeout(resolve, 350));
    const initial = await evaluate(`(() => ({
      filters: [...document.querySelectorAll('.order-filters__button')].map((item) => item.textContent.trim()),
      orders: document.querySelectorAll('.order-row').length,
    }))()`);
    assert.deepEqual(initial.filters, ['Завершён', 'В работе', 'Техсопровождение']);
    assert.equal(initial.orders, 3);

    await evaluate(`document.querySelectorAll('.order-filters__button')[1].click()`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.order-row h3')].map((item) => item.textContent)`), ['Telegram-бот с платным контентом']);

    await evaluate(`document.querySelectorAll('.order-filters__button')[2].click()`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.order-row h3')].map((item) => item.textContent)`), ['Telegram-бот с платным контентом', 'Техническое сопровождение CRM']);

    await evaluate(`document.querySelectorAll('.order-filters__button')[1].click()`);
    await evaluate(`document.querySelectorAll('.order-filters__button')[0].click()`);
    await evaluate(`document.querySelectorAll('.order-filters__button')[0].click()`);
    await evaluate(`document.querySelectorAll('.order-filters__button')[2].click()`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(await evaluate(`document.querySelectorAll('.order-row').length`), 3);

    await evaluate(`document.querySelector('.order-row__details').click()`);
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.match(await evaluate(`location.pathname`), /^\/account\/orders\/DM-1042$/);
    const detail = await evaluate(`(() => ({
      balanceLabel: document.querySelector('.account-balance span')?.textContent.trim(),
      balanceValue: document.querySelector('.account-balance strong')?.textContent.trim(),
      payment: document.querySelector('.account-order__payment-status')?.textContent.trim(),
      specificationItems: document.querySelectorAll('.account-order__specification li').length,
      attachments: [...document.querySelectorAll('.account-order__attachment')].map((item) => item.textContent.trim()),
      sidebarItems: [...document.querySelectorAll('.account-page__tab')].map((item) => item.textContent.trim()),
      logoutIsButton: document.querySelector('.account-page__logout')?.tagName,
    }))()`);
    assert.equal(detail.balanceLabel, 'Баланс');
    assert.equal(detail.balanceValue, '32 500 ₽');
    assert.equal(detail.payment, 'Оплачен');
    assert.equal(detail.specificationItems, 4);
    assert.deepEqual(detail.attachments, ['Техническое задание.pdf', 'Сценарии бота.docx']);
    assert.deepEqual(detail.sidebarItems, ['Заказы', 'Оплата', 'Личные данные', 'Безопасность', 'Чат']);
    assert.equal(detail.logoutIsButton, 'A');

    await send('Page.navigate', { url: 'http://127.0.0.1:5173/account' });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await evaluate(`[...document.querySelectorAll('.account-page__tab')].find((item) => item.textContent.trim() === 'Личные данные').click()`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.account-form input')].map((item) => item.name)`), ['firstName', 'lastName', 'email', 'phone', 'telegram', 'max', 'whatsapp']);

    await send('Page.navigate', { url: 'http://127.0.0.1:5173/account/payment' });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const payment = await evaluate(`(() => ({
      methods: document.querySelectorAll('.payment-page__methods article').length,
      amountInput: Boolean(document.querySelector('.balance-card input[type="number"]')),
      documents: document.querySelectorAll('.payment-page__documents a').length,
      activeTab: document.querySelector('.account-page__tab--active')?.textContent.trim(),
      path: location.pathname,
    }))()`);
    assert.equal(payment.path, '/account/payment');
    assert.equal(payment.methods, 3);
    assert.equal(payment.amountInput, true);
    assert.equal(payment.documents, 2);
    assert.equal(payment.activeTab, 'Оплата');

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/account' });
    await new Promise((resolve) => setTimeout(resolve, 250));
    const mobile = await evaluate(`(() => ({
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      sidebarDisplay: getComputedStyle(document.querySelector('.account-page__sidebar')).display,
      filtersOverflow: getComputedStyle(document.querySelector('.order-filters')).overflowX,
      balanceVisible: Boolean(document.querySelector('.account-balance')),
    }))()`);
    assert.equal(mobile.documentWidth, mobile.viewportWidth);
    assert.equal(mobile.sidebarDisplay, 'flex');
    assert.equal(mobile.filtersOverflow, 'auto');
    assert.equal(mobile.balanceVisible, true);
    socket.close();
  } finally {
    browserProcess.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
