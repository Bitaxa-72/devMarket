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

test('product page presents a working gallery and category portfolio before purchase', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-product-page-test-'));
  const port = await getAvailablePort();
  const browserProcess = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'http://127.0.0.1:5173/product/bots-1'], { stdio: 'ignore' });

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

    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.reload');
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const ready = await send('Runtime.evaluate', { expression: "document.readyState === 'complete' && Boolean(document.querySelector('.product-detail'))", returnByValue: true });
      if (ready.result?.result?.value) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const response = await send('Runtime.evaluate', {
      expression: `(async () => {
        const gallery = document.querySelector('.product-gallery');
        const order = document.querySelector('.product-detail__order');
        const info = document.querySelector('.product-detail__main');
        const related = document.querySelector('.product-related');
        const image = gallery?.querySelector('.product-gallery__image');
        const initialImage = image?.src;
        gallery?.querySelector('.product-gallery__control--next')?.click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const galleryRect = gallery?.getBoundingClientRect();
        const orderRect = order?.getBoundingClientRect();
        const infoRect = info?.getBoundingClientRect();
        const relatedRect = related?.getBoundingClientRect();
        return {
          galleryExists: Boolean(gallery),
          interval: gallery?.dataset.autoplayInterval,
          hasThumbnails: Boolean(gallery?.querySelector('.product-gallery__thumbnails')),
          imageChanged: Boolean(initialImage && image?.src && initialImage !== image.src),
          galleryLeftOfOrder: Boolean(galleryRect && orderRect && galleryRect.right < orderRect.left),
          infoBelowShowcase: Boolean(infoRect && galleryRect && orderRect && infoRect.top >= Math.min(galleryRect.bottom, orderRect.bottom)),
          relatedBelowInfo: Boolean(relatedRect && infoRect && relatedRect.top >= infoRect.bottom),
          relatedLinks: [...(related?.querySelectorAll('.portfolio-card') || [])].map((link) => link.getAttribute('href')),
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    assert.equal(response.result?.exceptionDetails, undefined, response.result?.exceptionDetails?.exception?.description || 'product page evaluation failed');
    const state = response.result.result.value;
    assert.equal(state.galleryExists, true);
    assert.equal(state.interval, '6000');
    assert.equal(state.hasThumbnails, false);
    assert.equal(state.imageChanged, true);
    assert.equal(state.galleryLeftOfOrder, true);
    assert.equal(state.infoBelowShowcase, true);
    assert.equal(state.relatedBelowInfo, true);
    assert.ok(state.relatedLinks.length >= 1);
    assert.ok(state.relatedLinks.every((href) => href?.startsWith('/projects/project-')));

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.reload');
    await new Promise((resolve) => setTimeout(resolve, 250));
    const mobileResponse = await send('Runtime.evaluate', {
      expression: `(() => {
        const titleRect = document.querySelector('.page-hero__title')?.getBoundingClientRect();
        const galleryRect = document.querySelector('.product-gallery')?.getBoundingClientRect();
        const orderRect = document.querySelector('.product-detail__order')?.getBoundingClientRect();
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          titleFits: Boolean(titleRect && titleRect.left >= 0 && titleRect.right <= innerWidth),
          galleryFits: Boolean(galleryRect && galleryRect.left >= 0 && galleryRect.right <= innerWidth),
          orderBelowGallery: Boolean(orderRect && galleryRect && orderRect.top >= galleryRect.bottom),
        };
      })()`,
      returnByValue: true,
    });
    const mobileState = mobileResponse.result.result.value;
    assert.equal(mobileState.documentWidth, mobileState.viewportWidth);
    assert.equal(mobileState.titleFits, true);
    assert.equal(mobileState.galleryFits, true);
    assert.equal(mobileState.orderBelowGallery, true);
    socket.close();
  } finally {
    browserProcess.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
