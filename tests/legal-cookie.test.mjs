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

test('legal pages use the site width and cookie choice persists', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-legal-cookie-test-'));
  const port = await getAvailablePort();
  const browserProcess = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--window-size=1440,900', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'http://127.0.0.1:5173/offer'], { stdio: 'ignore' });

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

    await send('Page.navigate', { url: 'http://127.0.0.1:5173/offer' });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const initial = await evaluate(`(() => ({
      legalWidth: document.querySelector('.legal-page').getBoundingClientRect().width,
      heroWidth: document.querySelector('.page-hero__container').getBoundingClientRect().width,
      hasSelfEmployedSection: document.body.textContent.includes('Налог на профессиональный доход'),
      cookieVisible: Boolean(document.querySelector('.cookie-consent')),
      cookieActions: document.querySelectorAll('.cookie-consent__button').length,
      privacyLink: document.querySelector('.cookie-consent__content a')?.getAttribute('href'),
    }))()`);
    assert.ok(Math.abs(initial.legalWidth - initial.heroWidth) < 1, JSON.stringify(initial));
    assert.equal(initial.hasSelfEmployedSection, true);
    assert.equal(initial.cookieVisible, true);
    assert.equal(initial.cookieActions, 2);
    assert.equal(initial.privacyLink, '/privacy');

    await evaluate(`document.querySelector('.cookie-consent__button--secondary').click()`);
    assert.equal(await evaluate(`localStorage.getItem('devmarket-cookie-consent')`), 'necessary');
    await send('Page.reload');
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.equal(await evaluate(`Boolean(document.querySelector('.cookie-consent'))`), false);

    await evaluate(`localStorage.removeItem('devmarket-cookie-consent')`);
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.reload');
    await new Promise((resolve) => setTimeout(resolve, 250));
    const mobile = await evaluate(`(() => ({
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      consentBottom: innerHeight - document.querySelector('.cookie-consent').getBoundingClientRect().bottom,
      actions: getComputedStyle(document.querySelector('.cookie-consent__actions')).gridTemplateColumns,
    }))()`);
    assert.equal(mobile.documentWidth, mobile.viewportWidth);
    assert.ok(mobile.consentBottom >= 74, JSON.stringify(mobile));
    assert.notEqual(mobile.actions, 'none');
    socket.close();
  } finally {
    browserProcess.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
