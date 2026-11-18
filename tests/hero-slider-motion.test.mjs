import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const browser = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseUrl = (process.env.DEVMARKET_TEST_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');

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

test('moves complete hero slides and loops without an empty frame', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-hero-motion-'));
  const port = await getAvailablePort();
  const process = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `${baseUrl}/`], { stdio: 'ignore' });

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
    const inspect = () => evaluate(`(() => {
      const hero = document.querySelector('.hero-slider').getBoundingClientRect();
      const track = document.querySelector('.hero-slider__track');
      const active = document.querySelector('.hero-slider__slide--active');
      const matrix = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      return {
        activeTitle: active?.querySelector('.hero-slider__title')?.textContent,
        activeLeft: active?.getBoundingClientRect().left,
        activeRight: active?.getBoundingClientRect().right,
        heroLeft: hero.left,
        heroRight: hero.right,
        trackX: matrix.m41,
        width: hero.width,
      };
    })()`);
    const next = () => evaluate("document.querySelectorAll('.hero-slider__arrow')[1].click()");

    await new Promise((resolve) => setTimeout(resolve, 500));
    const initial = await inspect();
    assert.equal(initial.activeTitle, 'Готовые решения');

    await next();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const moving = await inspect();
    assert.ok(moving.trackX < -moving.width && moving.trackX > -moving.width * 2, JSON.stringify(moving));

    await new Promise((resolve) => setTimeout(resolve, 500));
    const second = await inspect();
    assert.equal(second.activeTitle, 'Разработка под ключ');
    assert.ok(Math.abs(second.trackX + second.width * 2) < 1, JSON.stringify(second));

    await next();
    await new Promise((resolve) => setTimeout(resolve, 620));
    await next();
    await new Promise((resolve) => setTimeout(resolve, 620));
    const looped = await inspect();
    assert.equal(looped.activeTitle, 'Готовые решения');
    assert.ok(Math.abs(looped.trackX + looped.width) < 1, JSON.stringify(looped));
    assert.ok(looped.activeLeft < looped.heroRight && looped.activeRight > looped.heroLeft, JSON.stringify(looped));

    socket.close();
  } finally {
    const exited = new Promise((resolve) => process.once('exit', resolve));
    process.kill();
    await exited;
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});
