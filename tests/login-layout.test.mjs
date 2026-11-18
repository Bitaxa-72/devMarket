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

test('login panel fills the available viewport and centers both columns', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-login-layout-test-'));
  const port = await getAvailablePort();
  const browserProcess = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'http://127.0.0.1:5173/login'], { stdio: 'ignore' });

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
    const waitForTurnstile = async () => {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const response = await send('Runtime.evaluate', { expression: "Boolean(document.querySelector('.turnstile-field__widget')?.children.length)", returnByValue: true });
        if (response.result.result.value) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    const inspect = async () => {
      const response = await send('Runtime.evaluate', {
        expression: `(() => {
          const header = document.querySelector('.header, .account-site__header')?.getBoundingClientRect();
          const headerTop = document.querySelector('.header__top')?.getBoundingClientRect();
          const dock = document.querySelector('.header__mobile-dock')?.getBoundingClientRect();
          const page = document.querySelector('.auth-page')?.getBoundingClientRect();
          const visual = document.querySelector('.auth-page__visual');
          const visualRect = visual?.getBoundingClientRect();
          const visualFirst = visual?.firstElementChild?.getBoundingClientRect();
          const visualLast = visual?.lastElementChild?.getBoundingClientRect();
          const formWrap = document.querySelector('.auth-page__form-wrap')?.getBoundingClientRect();
          const form = document.querySelector('.auth-page__form')?.getBoundingClientRect();
          const submit = document.querySelector('.auth-form__submit')?.getBoundingClientRect();
          const forgot = document.querySelector('.auth-form__field-action a[href="/forgot-password"]')?.getBoundingClientRect();
          const turnstile = document.querySelector('.turnstile-field')?.getBoundingClientRect();
          return {
            viewportHeight: innerHeight,
            viewportWidth: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            documentHeight: document.documentElement.scrollHeight,
            headerBottom: header?.bottom,
            headerTopHeight: headerTop?.height,
            dockTop: dock?.top,
            pageTop: page?.top,
            pageBottom: page?.bottom,
            pageHeight: page?.height,
            visualDisplay: visual && getComputedStyle(visual).display,
            visualCenterGap: visualRect && visualFirst && visualLast ? Math.abs((visualFirst.top + visualLast.bottom) / 2 - (visualRect.top + visualRect.bottom) / 2) : null,
            formCenterGap: formWrap && form ? Math.abs((form.top + form.bottom) / 2 - (formWrap.top + formWrap.bottom) / 2) : null,
            formTop: form?.top,
            formBottom: form?.bottom,
            authActionGap: submit && forgot ? submit.top - forgot.bottom : null,
            turnstileHeight: turnstile?.height,
            turnstileSubmitGap: submit && turnstile ? submit.top - turnstile.bottom : null,
            authTabCount: document.querySelectorAll('.auth-tabs__link').length,
            activeAuthTab: document.querySelector('.auth-tabs__link--active')?.textContent?.trim(),
            forgotUnderPasswordInput: (() => {
              const link = document.querySelector('.auth-form__field-action a[href="/forgot-password"]')?.getBoundingClientRect();
              const input = document.querySelector('input[name="password"]')?.getBoundingClientRect();
              return Boolean(link && input && link.top >= input.bottom && Math.abs(link.right - input.right) < 2);
            })(),
            turnstilePresent: Boolean(document.querySelector('.turnstile-field')),
            turnstileConfigurationError: Boolean(document.querySelector('.turnstile-field__error')),
          };
        })()`,
        returnByValue: true,
      });
      return response.result.result.value;
    };

    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.reload');
    await waitForTurnstile();
    const desktop = await inspect();
    assert.ok(Math.abs(desktop.pageTop - desktop.headerBottom) < 1, JSON.stringify(desktop));
    assert.ok(Math.abs(desktop.pageBottom - desktop.viewportHeight) < 1, JSON.stringify(desktop));
    assert.ok(desktop.visualCenterGap < 3, JSON.stringify(desktop));
    assert.ok(desktop.formCenterGap < 2);
    assert.equal(desktop.documentHeight, desktop.viewportHeight);
    assert.equal(desktop.authTabCount, 2);
    assert.equal(desktop.activeAuthTab, 'Вход');
    assert.equal(desktop.forgotUnderPasswordInput, true);
    assert.ok(desktop.headerTopHeight <= 80, JSON.stringify(desktop));
    assert.equal(desktop.turnstilePresent, true);
    assert.equal(desktop.turnstileConfigurationError, false);
    assert.ok(desktop.turnstileHeight >= 65, JSON.stringify(desktop));
    assert.ok(desktop.turnstileSubmitGap <= 20, JSON.stringify(desktop));

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.reload');
    await waitForTurnstile();
    const mobile = await inspect();
    assert.equal(mobile.pageTop, 0, JSON.stringify(mobile));
    assert.equal(mobile.pageHeight, mobile.viewportHeight);
    assert.equal(mobile.visualDisplay, 'none');
    assert.ok(mobile.formCenterGap < 2);
    assert.ok(mobile.formTop >= mobile.headerBottom, JSON.stringify(mobile));
    assert.ok(mobile.formBottom <= mobile.dockTop, JSON.stringify(mobile));
    assert.equal(mobile.documentWidth, mobile.viewportWidth);
    assert.equal(mobile.documentHeight, mobile.viewportHeight);
    socket.close();
  } finally {
    browserProcess.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
