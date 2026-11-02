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

test('mobile header uses a five-item app dock with a matching more drawer', async () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-mobile-header-test-'));
  const port = await getAvailablePort();
  const browserProcess = spawn(browser, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'http://127.0.0.1:5173/'], { stdio: 'ignore' });
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
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 667, deviceScaleFactor: 1, mobile: true });
    await send('Page.reload');
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const ready = await send('Runtime.evaluate', { expression: "Boolean(document.querySelector('.header__mobile-dock'))", returnByValue: true });
      if (ready.result?.result?.value) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const response = await send('Runtime.evaluate', {
      expression: `(async () => {
        const initialHeaderTop = document.querySelector('.header__top');
        const initialHeaderTopRect = initialHeaderTop.getBoundingClientRect();
        const initialHeaderTopStyle = getComputedStyle(initialHeaderTop);
        const initialHeaderStyle = getComputedStyle(document.querySelector('.header'));
        const bodyStyle = getComputedStyle(document.body);
        const footerStyle = getComputedStyle(document.querySelector('.footer'));
        window.scrollTo(0, 500);
        await new Promise((resolve) => setTimeout(resolve, 250));
        const header = document.querySelector('.header');
        const logo = document.querySelector('.logo');
        const login = document.querySelector('.header__mobile-login');
        const language = document.querySelector('.header__mobile-language');
        const searchToggle = document.querySelector('.header__mobile-search-toggle');
        const search = document.querySelector('.header__search');
        const searchInput = document.querySelector('.header__search-input');
        const compactHeaderTopHeight = initialHeaderTop.getBoundingClientRect().height;
        const logoBeforeSearchRect = logo.getBoundingClientRect();
        const searchInitiallyHidden = !search.getClientRects().length;
        searchToggle?.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const logoAfterSearchRect = logo.getBoundingClientRect();
        const searchExpanded = search.getClientRects().length > 0 && search.getBoundingClientRect().width > 300;
        const searchFocused = document.activeElement === searchInput;
        const searchToggleExpanded = searchToggle?.getAttribute('aria-expanded');
        document.querySelector('.hero')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 50));
        const searchClosedOutside = !search.getClientRects().length && searchToggle?.getAttribute('aria-expanded') === 'false';
        const mobileDock = document.querySelector('.header__mobile-dock');
        const dockItems = [...mobileDock.querySelectorAll('.header__mobile-dock-item')];
        const dockContact = mobileDock.querySelector('.header__mobile-contact');
        const drawerToggle = mobileDock.querySelector('.header__mobile-more');
        const headerRect = header.getBoundingClientRect();
        const logoRect = logo.getBoundingClientRect();
        const loginRect = login.getBoundingClientRect();
        const languageRect = language.getBoundingClientRect();
        const dockRect = mobileDock.getBoundingClientRect();
        drawerToggle?.click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const drawer = document.querySelector('.header__more-sheet');
        const drawerRect = drawer?.getBoundingClientRect();
        const drawerLinks = [...(drawer?.querySelectorAll('.header__more-link') || [])];
        const primaryLinkRect = drawer?.querySelector('.header__more-link--primary')?.getBoundingClientRect();
        const legalLink = drawer?.querySelector('.header__more-link--legal');
        const legalLinkRect = legalLink?.getBoundingClientRect();
        const legalFontSize = legalLink ? parseFloat(getComputedStyle(legalLink).fontSize) : 0;
        const drawerToggleExpanded = drawerToggle?.getAttribute('aria-expanded');
        dockContact.click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const modal = document.querySelector('.contact-modal__content');
        const modalRect = modal.getBoundingClientRect();
        return {
          initialHeaderTopHeight: initialHeaderTopRect.height,
          compactHeaderTopHeight,
          initialHeaderTopRadius: parseFloat(initialHeaderTopStyle.borderBottomLeftRadius),
          headerBackground: initialHeaderStyle.backgroundColor,
          headerPosition: initialHeaderStyle.position,
          bodyBottomPadding: parseFloat(bodyStyle.paddingBottom),
          footerBottomPadding: parseFloat(footerStyle.paddingBottom),
          headerTop: headerRect.top,
          logoTopGap: logoRect.top - headerRect.top,
          loginVisible: Boolean(login.getClientRects().length),
          loginRight: loginRect.right,
          loginHref: login.getAttribute('href'),
          loginText: login.textContent.trim(),
          languageVisible: Boolean(language.getClientRects().length),
          languageRight: languageRect.right,
          languageText: language.querySelector('button').textContent.trim(),
          menuButtonVisible: Boolean(document.querySelector('.header__menu-button')?.getClientRects().length),
          searchToggleExpanded,
          searchInitiallyHidden,
          searchExpanded,
          searchFocused,
          searchLogoShift: Math.hypot(logoAfterSearchRect.left - logoBeforeSearchRect.left, logoAfterSearchRect.top - logoBeforeSearchRect.top),
          searchClosedOutside,
          dockPosition: getComputedStyle(mobileDock).position,
          dockBoxShadow: getComputedStyle(mobileDock).boxShadow,
          dockHeight: dockRect.height,
          dockRightGap: innerWidth - dockRect.right,
          dockLeftGap: dockRect.left,
          dockBottomGap: innerHeight - dockRect.bottom,
          dockLabels: dockItems.map((item) => item.querySelector('span:not(.header__cart-count)').textContent.trim()),
          dockHrefs: dockItems.map((item) => item.getAttribute('href')),
          moreButtonExists: Boolean(drawerToggle),
          drawerToggleExpanded,
          moreSheetExists: Boolean(drawer),
          drawerClearsDock: drawerRect ? drawerRect.bottom <= dockRect.top - 8 : false,
          drawerLabels: drawerLinks.map((item) => item.textContent.trim()),
          drawerHrefs: drawerLinks.map((item) => item.getAttribute('href')),
          drawerHandleExists: Boolean(drawer?.querySelector('.header__more-handle')),
          legalLinkIsWide: Boolean(primaryLinkRect && legalLinkRect && legalLinkRect.width > primaryLinkRect.width * 2),
          legalFontSize,
          modalTop: modalRect.top,
          modalBottom: modalRect.bottom,
          modalCenterGap: Math.abs((modalRect.top + modalRect.bottom) / 2 - innerHeight / 2),
          modalOverflow: getComputedStyle(modal).overflowY,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    socket.close();
    assert.equal(response.result?.exceptionDetails, undefined, response.result?.exceptionDetails?.exception?.description || 'mobile header evaluation failed');
    const state = response.result.result.value;
    assert.ok(state.initialHeaderTopHeight <= 68, 'mobile top panel is too tall');
    assert.equal(state.compactHeaderTopHeight, state.initialHeaderTopHeight, 'mobile top panel changes height after scrolling');
    assert.ok(state.initialHeaderTopRadius >= 18, 'mobile top panel has no visible rounding');
    assert.equal(state.headerBackground, 'rgba(0, 0, 0, 0)', 'top rounding has a visible substrate');
    assert.equal(state.headerPosition, 'fixed', 'header does not overlay the underlying section');
    assert.equal(state.bodyBottomPadding, 0, 'body creates a white layer below the dock');
    assert.ok(state.footerBottomPadding >= 64, 'footer does not reserve space for the dock');
    assert.ok(Math.abs(state.headerTop) < 1);
    assert.ok(state.logoTopGap >= 10);
    assert.equal(state.loginVisible, true);
    assert.equal(state.loginHref, '/login');
    assert.equal(state.loginText, 'Войти');
    assert.ok(state.loginRight <= 390, 'login is clipped by the viewport');
    assert.equal(state.languageVisible, true);
    assert.match(state.languageText, /RU/);
    assert.ok(state.languageRight <= 390, 'language switcher is clipped by the viewport');
    assert.equal(state.menuButtonVisible, false);
    assert.equal(state.searchToggleExpanded, 'true');
    assert.equal(state.searchInitiallyHidden, true);
    assert.equal(state.searchExpanded, true);
    assert.equal(state.searchFocused, true);
    assert.ok(state.searchLogoShift < 1, 'opening search moves the top navigation items');
    assert.equal(state.searchClosedOutside, true);
    assert.equal(state.dockPosition, 'fixed');
    assert.match(state.dockBoxShadow, /-12px 32px/, 'mobile dock shadow does not separate it from white sections');
    assert.ok(state.dockHeight <= 66, 'mobile dock is too tall');
    assert.ok(state.dockRightGap < 1 && state.dockLeftGap < 1 && state.dockBottomGap < 1);
    assert.deepEqual(state.dockLabels, ['Каталог', 'Услуги', 'Связь', 'Корзина', 'Ещё']);
    assert.deepEqual(state.dockHrefs, ['/catalog', '/services', null, '/cart', null]);
    assert.equal(state.moreButtonExists, true);
    assert.equal(state.drawerToggleExpanded, 'true');
    assert.equal(state.moreSheetExists, true);
    assert.equal(state.drawerClearsDock, true);
    assert.deepEqual(state.drawerLabels, ['Проекты', 'Новости', 'Акции', 'Оплата', 'Политика конфиденциальности', 'Публичная оферта']);
    assert.deepEqual(state.drawerHrefs, ['/projects', '/news', '/promotions', '/payment', '/privacy', '/offer']);
    assert.equal(state.drawerHandleExists, true);
    assert.equal(state.legalLinkIsWide, true);
    assert.ok(state.legalFontSize >= 12, 'legal links are too small to read');
    assert.ok(state.modalTop >= 16 && state.modalBottom <= 651);
    assert.ok(state.modalCenterGap < 2);
    assert.equal(state.modalOverflow, 'auto');
  } finally {
    browserProcess.kill();
    await new Promise((resolve) => setTimeout(resolve, 250));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
