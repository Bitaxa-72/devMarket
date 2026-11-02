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

test('inner page introductions stay compact and expose primary content in the first viewport', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-compact-hero-test-'));
  const port = await getAvailablePort();
  const browserProcess = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--window-size=1440,900', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'http://127.0.0.1:5173/catalog'], { stdio: 'ignore' });

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

    const inspectPage = async (path, primarySelector) => {
      await send('Page.navigate', { url: `http://127.0.0.1:5173${path}` });
      await new Promise((resolve) => setTimeout(resolve, 300));
      const response = await send('Runtime.evaluate', {
        expression: `(() => {
          const hero = document.querySelector('.page-hero')?.getBoundingClientRect();
          const primary = document.querySelector('${primarySelector}')?.getBoundingClientRect();
          const purchase = document.querySelector('.product-detail__order .ui-button--primary')?.getBoundingClientRect();
          return {
            heroHeight: hero?.height,
            primaryTop: primary?.top,
            purchaseBottom: purchase?.bottom,
            breadcrumbsVisible: Boolean(document.querySelector('.page-hero__breadcrumbs')?.getClientRects().length),
            eyebrowVisible: Boolean(document.querySelector('.page-hero__eyebrow')?.getClientRects().length),
            titleVisible: Boolean(document.querySelector('.page-hero__title')?.getClientRects().length),
          };
        })()`,
        returnByValue: true,
      });
      return response.result.result.value;
    };

    const catalog = await inspectPage('/catalog', '.catalog-page__grid');
    const product = await inspectPage('/product/bots-1', '.product-gallery');
    const services = await inspectPage('/services', '.services-page__container');

    for (const state of [catalog, product, services]) {
      assert.ok(state.heroHeight <= 180, `page hero is too tall: ${state.heroHeight}px`);
      assert.equal(state.breadcrumbsVisible, true);
      assert.equal(state.eyebrowVisible, false);
      assert.equal(state.titleVisible, true);
    }
    assert.ok(catalog.primaryTop <= 470, `catalog cards start too low: ${catalog.primaryTop}px`);
    assert.ok(product.primaryTop <= 390, `product gallery starts too low: ${product.primaryTop}px`);
    assert.ok(product.purchaseBottom <= 900, `purchase action is outside the first viewport: ${product.purchaseBottom}px`);
    socket.close();
  } finally {
    browserProcess.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
