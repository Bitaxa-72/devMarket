import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
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

async function getPageState() {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-hero-style-test-'));
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
    'http://127.0.0.1:5173/',
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
            for (let attempt = 0; attempt < 40 && !document.querySelector('.news__card'); attempt += 1) {
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            const visual = document.querySelector('.hero__visual');
            const image = document.querySelector('.hero__project-image');
            const visualStyle = getComputedStyle(visual);
            const imageStyle = getComputedStyle(image);
            const headerContact = document.querySelector('.header__navigation-message');
            const headerContactStyle = getComputedStyle(headerContact);
            const parseColor = (value) => value.match(/\\d+/g).slice(0, 3).map(Number);
            const coverColor = parseColor(getComputedStyle(document.querySelector('.product-card__cover')).backgroundColor);
            const catalogColor = parseColor(getComputedStyle(document.querySelector('.catalog__showcase')).backgroundColor);
            const projectsTrack = document.querySelector('.projects__track');
            const projectCard = document.querySelector('.projects__card');
            const projectsGap = parseFloat(getComputedStyle(projectsTrack).columnGap);
            const projectTitleStyle = getComputedStyle(document.querySelector('.projects__card-title'));
            const projectDescriptionStyle = getComputedStyle(document.querySelector('.projects__description'));
            const projectCategoryStyle = getComputedStyle(document.querySelector('.projects__category'));
            const projectCardRect = projectCard.getBoundingClientRect();
            projectCard.focus();
            await new Promise((resolve) => setTimeout(resolve, 250));
            const projectCardFocusedRect = projectCard.getBoundingClientRect();
            const projectCardFocusedTransform = getComputedStyle(projectCard).transform;
            const projectCardFocusedBoxShadow = getComputedStyle(projectCard).boxShadow;
            const newsCard = document.querySelector('.news__card');
            const newsTitle = newsCard.querySelector('.news__card-title');
            const newsImage = newsCard.querySelector('.news__cover-image');
            const newsCategory = newsCard.querySelector('.news__cover-category');
            newsCard.focus();
            await new Promise((resolve) => setTimeout(resolve, 350));
            const newsTitleFocusedColor = getComputedStyle(newsTitle).color;
            const newsImageFocusedTransform = getComputedStyle(newsImage).transform;
            const newsCategoryFocusedBackground = getComputedStyle(newsCategory).backgroundColor;
            const languageButton = document.querySelector('.header__language-button');
            const languageButtonWidthRu = languageButton.getBoundingClientRect().width;
            document.querySelectorAll('.header__language-option')[1].click();
            await new Promise((resolve) => setTimeout(resolve, 20));
            const languageButtonWidthEn = languageButton.getBoundingClientRect().width;
            document.querySelectorAll('.header__language-option')[2].click();
            await new Promise((resolve) => setTimeout(resolve, 20));
            const languageButtonWidthVi = languageButton.getBoundingClientRect().width;
            const header = document.querySelector('.header');
            window.scrollTo(0, 0);
            await new Promise((resolve) => setTimeout(resolve, 180));
            const headerInitialHeight = header.getBoundingClientRect().height;
            window.scrollTo(0, 500);
            await new Promise((resolve) => setTimeout(resolve, 180));
            const headerScrolledRect = header.getBoundingClientRect();
            const headerScrolledStyle = getComputedStyle(header);
            document.querySelector('.header__navigation-message').click();
            await new Promise((resolve) => setTimeout(resolve, 50));
            return {
              backgroundColor: visualStyle.backgroundColor,
              clipPath: visualStyle.clipPath,
              imageObjectFit: imageStyle.objectFit,
              visualHeight: visual.getBoundingClientRect().height,
              imageHeight: image.getBoundingClientRect().height,
              productCoverHeight: document.querySelector('.product-card__cover').getBoundingClientRect().height,
              productCoverContrast: coverColor.reduce((total, channel, index) => total + Math.abs(channel - catalogColor[index]), 0),
              contactLinks: [...document.querySelectorAll('.contact-modal__item')].map((item) => item.getAttribute('href')),
              contactIconColors: [...document.querySelectorAll('.contact-modal__item-logo')].map((item) => getComputedStyle(item).backgroundColor),
              headerContactBackground: headerContactStyle.backgroundColor,
              headerContactHeight: headerContact.getBoundingClientRect().height,
              visibleProjectCards: Math.floor((projectsTrack.clientWidth + projectsGap) / (projectCard.getBoundingClientRect().width + projectsGap)),
              projectPreviewHeight: document.querySelector('.projects__preview').getBoundingClientRect().height,
              hasProjectBrandFallback: Boolean(document.querySelector('.projects__preview-brand-mark')),
              hasOldProjectMockup: Boolean(document.querySelector('.projects__preview-window')),
              projectCardBackground: getComputedStyle(projectCard).backgroundColor,
              projectSummaryBackground: getComputedStyle(document.querySelector('.projects__summary')).backgroundColor,
              projectTitleSize: parseFloat(projectTitleStyle.fontSize),
              projectDescriptionSize: parseFloat(projectDescriptionStyle.fontSize),
              projectDescriptionColor: projectDescriptionStyle.color,
              projectCategoryBackground: projectCategoryStyle.backgroundColor,
              projectCardTag: projectCard.tagName,
              projectCardHref: projectCard.getAttribute('href'),
              projectCardCursor: getComputedStyle(projectCard).cursor,
              projectCardFocusedTransform,
              projectCardFocusedBoxShadow,
              projectCardWidth: projectCardRect.width,
              projectCardHeight: projectCardRect.height,
              projectCardFocusedWidth: projectCardFocusedRect.width,
              projectCardFocusedHeight: projectCardFocusedRect.height,
              advantagesProjectShots: document.querySelectorAll('.advantages__project-shot').length,
              hasAdvantagesPlaceholder: Boolean(document.querySelector('.advantages__screen')),
              newsCardTag: newsCard.tagName,
              newsCardHref: newsCard.getAttribute('href'),
              newsCardBorderWidth: getComputedStyle(newsCard).borderWidth,
              newsCardCursor: getComputedStyle(newsCard).cursor,
              newsImages: document.querySelectorAll('.news__cover-image').length,
              hasNewsPlaceholder: Boolean(document.querySelector('.news__cover-icon, .news__cover-grid')),
              newsTitleFocusedColor,
              newsImageFocusedTransform,
              newsCategoryFocusedBackground,
              languageButtonWidthRu,
              languageButtonWidthEn,
              languageButtonWidthVi,
              headerInitialHeight,
              headerScrolledHeight: headerScrolledRect.height,
              headerScrolledTop: headerScrolledRect.top,
              headerPosition: headerScrolledStyle.position,
              headerIsCompact: header.classList.contains('header--compact'),
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
    let cleanupError;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      try {
        rmSync(profile, { recursive: true, force: true });
        cleanupError = undefined;
        break;
      } catch (error) {
        cleanupError = error;
      }
    }
    if (cleanupError) throw cleanupError;
  }
}

test('hero shows one large Termburg project without unrelated mockups', () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-hero-test-'));

  try {
    const html = execFileSync(browser, [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-mode',
      '--disable-extensions',
      '--no-first-run',
      '--dump-dom',
      `--user-data-dir=${profile}`,
      'http://127.0.0.1:5173/',
    ], { encoding: 'utf8', timeout: 15000 });

    assert.equal(html.includes('alt="Termburg website"'), true, 'Termburg project is missing');
    assert.equal(html.includes('href="/projects"'), true, 'projects page link is missing');
    assert.equal(html.includes('aria-label="View our projects"'), true, 'compact projects link is missing');
    assert.equal(html.includes('class="hero__case"'), true, 'project card is missing');
    assert.equal(html.includes('hero__case-tags'), true, 'project card tags are missing');
    assert.equal(html.includes('Tigrbusiness'), false, 'unrelated mobile project is still visible');
    assert.equal(html.includes('hero__browser-bar'), false, 'browser mockup is still visible');
    assert.equal(html.includes('>ONLINE<'), false, 'old synthetic graphic is still visible');
  } finally {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
    rmSync(profile, { recursive: true, force: true });
  }
});

test('product cards use a large branded fallback without sequence numbers', () => {
  const profile = mkdtempSync(join(tmpdir(), 'devmarket-catalog-test-'));

  try {
    const html = execFileSync(browser, [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-mode',
      '--disable-extensions',
      '--no-first-run',
      '--dump-dom',
      `--user-data-dir=${profile}`,
      'http://127.0.0.1:5173/',
    ], { encoding: 'utf8', timeout: 15000 });

    assert.equal(html.includes('product-card__brand-mark'), true, 'branded fallback is missing');
    assert.equal(html.includes('product-card__cover-number'), false, 'sequence numbers are still visible');
    assert.equal(html.includes('product-card__link'), true, 'product card is not linked to its detail page');
    assert.equal(html.includes('product-card__cart'), true, 'product card has no add-to-cart action');
  } finally {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
    rmSync(profile, { recursive: true, force: true });
  }
});

test('hero artwork fills a neutral right panel without geometric clipping', async () => {
  const styles = await getPageState();

  assert.equal(styles.backgroundColor, 'rgba(0, 0, 0, 0)');
  assert.equal(styles.clipPath, 'none');
  assert.equal(styles.imageObjectFit, 'cover');
  assert.ok(Math.abs(styles.visualHeight - styles.imageHeight) < 1, 'artwork does not fill the panel height');
  assert.ok(styles.productCoverHeight >= 220, 'product media area is too small');
});

test('contact modal exposes the provided Telegram, MAX, email and WhatsApp links', async () => {
  const state = await getPageState();

  assert.deepEqual(state.contactLinks, [
    'https://t.me/vitaly_development',
    'https://max.ru/u/f9LHodD0cOLxaNMMVcuOWuGlWa_LmUa_w52aRyo29sn2AKN-i_9Mu60ATy4',
    'mailto:vitaly.butenev@gmail.com',
    'https://wa.me/84769457149?s=p',
  ]);
});

test('branded product fallback is clearly separated from the catalog background', async () => {
  const state = await getPageState();

  assert.ok(state.productCoverContrast >= 250, 'branded fallback still blends into the catalog background');
});

test('contact logos use their brand colors', async () => {
  const state = await getPageState();

  assert.deepEqual(state.contactIconColors, [
    'rgb(38, 165, 228)',
    'rgb(71, 26, 255)',
    'rgb(234, 67, 53)',
    'rgb(37, 211, 102)',
  ]);
});

test('header contact action is styled as a prominent button', async () => {
  const state = await getPageState();

  assert.equal(state.headerContactBackground, 'rgb(132, 183, 45)');
  assert.ok(state.headerContactHeight >= 44, 'header contact button is too small');
});

test('projects show three cards with taller branded previews', async () => {
  const state = await getPageState();

  assert.ok(state.visibleProjectCards >= 3, 'fewer than three project cards fit in the track');
  assert.ok(state.projectPreviewHeight >= 190, 'project preview is too short');
  assert.equal(state.hasProjectBrandFallback, true, 'project brand fallback is missing');
  assert.equal(state.hasOldProjectMockup, false, 'old synthetic project mockup is still visible');
});

test('project card bodies use the same gray surface as the summary', async () => {
  const state = await getPageState();

  assert.equal(state.projectCardBackground, state.projectSummaryBackground);
});

test('project card text has a strong readable hierarchy', async () => {
  const state = await getPageState();

  assert.ok(state.projectTitleSize >= 20, 'project title is too small');
  assert.ok(state.projectDescriptionSize >= 14, 'project description is too small');
  assert.equal(state.projectDescriptionColor, 'rgb(64, 70, 86)');
  assert.notEqual(state.projectCategoryBackground, 'rgba(0, 0, 0, 0)');
});

test('the entire project card is an interactive portfolio link', async () => {
  const state = await getPageState();

  assert.equal(state.projectCardTag, 'A');
  assert.equal(state.projectCardHref, '/projects/project-1');
  assert.equal(state.projectCardCursor, 'pointer');
  assert.equal(state.projectCardFocusedTransform, 'none');
  assert.match(state.projectCardFocusedBoxShadow, /inset/);
  assert.equal(state.projectCardFocusedWidth, state.projectCardWidth);
  assert.equal(state.projectCardFocusedHeight, state.projectCardHeight);
});

test('advantages visual uses three real portfolio screenshots', async () => {
  const state = await getPageState();

  assert.equal(state.advantagesProjectShots, 3);
  assert.equal(state.hasAdvantagesPlaceholder, false);
});

test('each news card is one borderless link with a thematic image', async () => {
  const state = await getPageState();

  assert.equal(state.newsCardTag, 'A');
  assert.equal(state.newsCardHref, '/news/article-1');
  assert.equal(state.newsCardBorderWidth, '0px');
  assert.equal(state.newsCardCursor, 'pointer');
  assert.equal(state.newsImages, 5);
  assert.equal(state.hasNewsPlaceholder, false);
  assert.equal(state.newsTitleFocusedColor, 'rgb(110, 158, 33)');
  assert.notEqual(state.newsImageFocusedTransform, 'none');
  assert.equal(state.newsCategoryFocusedBackground, 'rgb(132, 183, 45)');
});

test('language switcher keeps a fixed width for every language', async () => {
  const state = await getPageState();

  assert.equal(state.languageButtonWidthRu, 94);
  assert.equal(state.languageButtonWidthEn, state.languageButtonWidthRu);
  assert.equal(state.languageButtonWidthVi, state.languageButtonWidthRu);
});

test('header stays visible and becomes compact after scrolling', async () => {
  const state = await getPageState();

  assert.equal(state.headerPosition, 'sticky');
  assert.ok(Math.abs(state.headerScrolledTop) < 1, 'header is not pinned to the top');
  assert.equal(state.headerIsCompact, true);
  assert.ok(state.headerScrolledHeight < state.headerInitialHeight, 'header did not become smaller');
});
