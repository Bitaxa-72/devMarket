import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const browser = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pages = [
  ['/catalog', '.catalog-page__container'],
  ['/product/bots-1', '.product-detail__container'],
  ['/payment', '.payment-page__container'],
  ['/cart', '.cart-page__container'],
  ['/account', '.account-page__container'],
  ['/contacts', '.contacts-page__container'],
  ['/projects', '.portfolio-page__container'],
  ['/projects/project-1', '.case-page__container'],
  ['/news/article-1', '.article-page'],
];

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

function createClient(socket) {
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) return;
    pending.get(message.id)(message);
    pending.delete(message.id);
  });
  return (method, params = {}) => new Promise((resolve) => {
    id += 1;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

test('inner page containers align with the header container', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-inner-width-test-'));
  const port = await getAvailablePort();
  const process = spawn(browser, [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-mode',
    '--disable-extensions',
    '--no-first-run',
    '--window-size=1440,1000',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'http://127.0.0.1:5173/payment',
  ], { stdio: 'ignore' });

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
    const send = createClient(socket);

    for (const [path, selector] of pages) {
      await send('Page.navigate', { url: `http://127.0.0.1:5173${path}` });
      await new Promise((resolve) => setTimeout(resolve, 350));
      const response = await send('Runtime.evaluate', {
        expression: `(() => {
          const header = document.querySelector('.header__container')?.getBoundingClientRect();
          const content = document.querySelector('${selector}')?.getBoundingClientRect();
          const receiptEmail = document.querySelector('input[name="receiptEmail"]');
          const portfolioCards = [...document.querySelectorAll('.portfolio-card')];
          return {
            header: header && { left: header.left, width: header.width },
            content: content && { left: content.left, width: content.width },
            receiptEmail: receiptEmail && { type: receiptEmail.type, required: receiptEmail.required },
            paymentProvider: document.querySelector('.balance-card small')?.textContent,
            trustBandCount: document.querySelectorAll('.trust-band').length,
            portfolio: {
              cardCount: portfolioCards.length,
              imageCount: document.querySelectorAll('.portfolio-card__visual img').length,
              firstCardTag: portfolioCards[0]?.tagName,
              firstCardHref: portfolioCards[0]?.getAttribute('href'),
              visualHeight: document.querySelector('.portfolio-card__visual')?.getBoundingClientRect().height,
            },
            projectDetail: {
              galleryImageCount: document.querySelectorAll('.case-page__gallery-stage > img').length,
              thumbnailCount: document.querySelectorAll('.case-page__gallery-thumbnail').length,
              controlCount: document.querySelectorAll('.case-page__gallery-control').length,
              price: document.querySelector('.case-page__facts strong')?.textContent,
              stageHeight: document.querySelector('.case-page__gallery-stage')?.getBoundingClientRect().height,
              autoplayInterval: document.querySelector('.case-page__gallery')?.dataset.autoplayInterval,
              externalLink: document.querySelector('.case-page__actions a')?.getAttribute('href'),
            },
          };
        })()`,
        returnByValue: true,
      });
      const state = response.result.result.value;
      assert.ok(state.content, `${path} content is missing`);
      assert.ok(Math.abs(state.header.left - state.content.left) < 1, `${path} left edge is not aligned`);
      assert.ok(Math.abs(state.header.width - state.content.width) < 1, `${path} width is not aligned`);
      assert.equal(state.trustBandCount, 1, `${path} must contain one trust band`);
      if (path === '/payment') {
        assert.deepEqual(state.receiptEmail, { type: 'email', required: true });
        assert.match(state.paymentProvider, /ЮKassa/);
      }
      if (path === '/projects') {
        assert.equal(state.portfolio.cardCount, 5);
        assert.equal(state.portfolio.imageCount, 5);
        assert.equal(state.portfolio.firstCardTag, 'A');
        assert.equal(state.portfolio.firstCardHref, '/projects/project-1');
        assert.ok(state.portfolio.visualHeight >= 339, 'project preview is too short');
      }
      if (path === '/projects/project-1') {
        assert.equal(state.projectDetail.galleryImageCount, 1);
        assert.equal(state.projectDetail.thumbnailCount, 0);
        assert.equal(state.projectDetail.controlCount, 2);
        assert.match(state.projectDetail.price, /₽/);
        assert.ok(state.projectDetail.stageHeight >= 519, 'project gallery is too short');
        assert.equal(state.projectDetail.autoplayInterval, '6000');
        assert.equal(state.projectDetail.externalLink, 'https://selibox.com');
      }
    }
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
    await new Promise((resolve) => setTimeout(resolve, 350));
    const homeResponse = await send('Runtime.evaluate', {
      expression: "document.querySelectorAll('.trust-band').length",
      returnByValue: true,
    });
    assert.equal(homeResponse.result.result.value, 0, 'home page must not contain the inner-page trust band');
    socket.close();
  } finally {
    process.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
