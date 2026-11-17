# Home Hero Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static homepage hero with an accessible, responsive, infinitely looping three-slide portfolio banner.

**Architecture:** Extract the hero into a focused React component backed by a small pure index-wrapping helper. Keep its complete BEM styling in a dedicated stylesheet, remove the obsolete hero rules from the oversized shared stylesheet, and retain the existing contact-modal and routing interfaces.

**Tech Stack:** React 19, React Router, Vite, CSS, Node test runner

**Spec:** `docs/superpowers/specs/2026-11-17-home-hero-slider-design.md`

## Global Constraints

- Use only SeliBox, Hotline Service and Termburg assets already present in the portfolio.
- Use BEM classes without `!important` or selector-combination overrides.
- Autoplay interval is 7000ms and is disabled under reduced motion.
- Keep files under 600 lines and preserve the existing devmarket palette.
- Preserve keyboard access, visible focus, descriptive controls and responsive behavior down to 320px.

## Review Focus

- Previous/next navigation at both ends wraps to the opposite end.
- Pagination changes directly to the requested slide and exposes the active state.
- Hover and focus pause autoplay without trapping focus or leaving it paused after exit.
- Rapid manual interaction resets the autoplay interval without creating multiple timers.
- Mobile layout keeps all controls visible and avoids horizontal overflow at 320px.

---

### Task 1: Slider index behavior

**Files:**
- Create: `src/utils/slider.js`
- Create: `tests/slider.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `wrapSlideIndex(index: number, count: number): number`

- [ ] Write Node tests for forward wrap, backward wrap, direct indexes and invalid slide counts.
- [ ] Run `npm.cmd test` and confirm failure because the helper does not exist.
- [ ] Implement `wrapSlideIndex` with modulo wrapping and a range error for counts below one.
- [ ] Run `npm.cmd test` and confirm all tests pass.

### Task 2: Hero slider component

**Files:**
- Create: `src/components/HeroSlider.jsx`
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `wrapSlideIndex`, `onOpenContacts(): void`
- Produces: `HeroSlider({ onOpenContacts }): JSX.Element`

- [ ] Define the three factual slide records with their existing image imports, route actions and project labels.
- [ ] Implement wrapped arrow navigation, direct pagination, 7000ms autoplay and interval reset after manual navigation.
- [ ] Pause autoplay on hover and focus, resume on exit, and disable it with `prefers-reduced-motion`.
- [ ] Add carousel semantics, live slide content, accessible control labels and keyboard arrow handling.
- [ ] Replace the static hero markup in `HomePage` with `HeroSlider`.
- [ ] Run `npm.cmd test` and `npm.cmd run build`.

### Task 3: Geometric visual system and responsive layout

**Files:**
- Create: `src/styles/hero-slider.css`
- Modify: `src/main.jsx`
- Modify: `src/styles/index.css`

**Interfaces:**
- Consumes: BEM structure from `HeroSlider`
- Produces: desktop, tablet and mobile layouts for `.hero-slider`

- [ ] Import the dedicated stylesheet after the shared stylesheet.
- [ ] Build the desktop split layout, geometric visual plane, framed project screenshot, edge arrows and left pagination.
- [ ] Add controlled content and image transitions with a complete reduced-motion override.
- [ ] Add tablet and mobile rules, including stacked content, simplified geometry, full-width actions and 44px controls.
- [ ] Remove all obsolete `.hero` rules and stale hero selectors from `index.css` instead of overriding them.
- [ ] Run the Impeccable detector against the changed component and styles.

### Task 4: Verification, documentation and deployment

**Files:**
- Modify: `../context/context.md`
- Create: `../backup/devmarket-frontend-<timestamp>.tar.gz`

**Interfaces:**
- Consumes: built `dist` output
- Produces: verified server release under `/var/www/devmarket/releases/<timestamp>`

- [ ] Run tests and a fresh production build.
- [ ] Inspect the rendered hero at desktop, tablet and mobile sizes, including reduced motion and keyboard controls.
- [ ] Scan changed sources for encoding damage, `!important`, duplicate hero selectors and temporary artifacts.
- [ ] Update project context with the approved interaction and visual decisions.
- [ ] Archive the built frontend locally, upload an isolated release, atomically update `/var/www/devmarket/current`, validate nginx and verify existing sites remain unchanged.
