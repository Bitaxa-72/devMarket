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

async function getNewsPageState() {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-news-page-test-'));
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
    'http://127.0.0.1:5173/news',
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    const result = await new Promise((resolve, reject) => {
      socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        if (message.id === 1) resolve(message.result.result.value);
      });
      socket.addEventListener('error', reject, { once: true });
      socket.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(async () => {
            const initialCards = [...document.querySelectorAll('.articles-page__grid .news__card')];
            const categories = [...document.querySelectorAll('.articles-page__categories .filter-tabs__button')];
            const initialState = {
              hasFeatured: Boolean(document.querySelector('.articles-page__featured')),
              cardCount: initialCards.length,
              imageCount: document.querySelectorAll('.articles-page__grid .news__cover-image').length,
              categoryCount: categories.length,
              firstCardTag: initialCards[0]?.tagName,
              firstCardHref: initialCards[0]?.getAttribute('href'),
              gridCardWidth: initialCards[0]?.getBoundingClientRect().width,
              batchSize: document.querySelector('.articles-page__grid')?.dataset.batchSize,
              paginationCount: document.querySelectorAll('.pagination').length,
              hasLoadTrigger: Boolean(document.querySelector('.articles-page__loader')),
            };
            categories[1]?.click();
            await new Promise((resolve) => setTimeout(resolve, 100));
            return {
              ...initialState,
              filteredCardCount: document.querySelectorAll('.articles-page__grid .news__card').length,
              activeCategory: document.querySelector('.filter-tabs__button--active')?.textContent,
            };
          })()`,
          awaitPromise: true,
          returnByValue: true,
        },
      }));
    });
    socket.close();
    return result;
  } finally {
    process.kill();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      try {
        rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
        break;
      } catch {}
    }
  }
}

test('news page uses category filters and the same image cards as the homepage', async () => {
  const state = await getNewsPageState();

  assert.equal(state.hasFeatured, false);
  assert.equal(state.cardCount, 5);
  assert.equal(state.imageCount, 5);
  assert.equal(state.categoryCount, 6);
  assert.equal(state.firstCardTag, 'A');
  assert.equal(state.firstCardHref, '/news/article-1');
  assert.ok(state.gridCardWidth > 360, 'news cards do not fill the page grid');
  assert.equal(state.batchSize, '12');
  assert.equal(state.paginationCount, 0);
  assert.equal(state.hasLoadTrigger, false);
  assert.equal(state.filteredCardCount, 1);
  assert.ok(state.activeCategory?.length > 0);
});
