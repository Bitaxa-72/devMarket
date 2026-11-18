import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const component = readFileSync(new URL('../src/components/HeroSlider.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/hero-slider.css', import.meta.url), 'utf8');

test('uses a smooth scalable clip path for the desktop hero image', () => {
  assert.match(component, /clipPathUnits="objectBoundingBox"/);
  assert.match(component, /<path d="[^"]*C[^"]*"/);
  assert.match(component, /C \.01 \.5626 0 \.53 0 \.5 C 0 \.47 \.01 \.4374 \.02 \.41/);
  assert.doesNotMatch(component, /C [^"]*-\./);
  assert.match(styles, /\.hero-slider__frame\s*\{[^}]*clip-path:\s*url\(#hero-slider-frame-clip\)/s);
  assert.match(styles, /\.hero-slider__frame\s*\{[^}]*inset:\s*-1px[^;]*-1px 0;/s);
  assert.doesNotMatch(styles, /\.hero-slider__frame\s*\{[^}]*clip-path:\s*polygon\(/s);
});

test('moves complete slides on a horizontal looping track', () => {
  assert.match(component, /const renderedSlides = \[/);
  assert.match(component, /onTransitionEnd=\{handleTrackTransitionEnd\}/);
  assert.match(component, /--hero-track-index/);
  assert.match(styles, /\.hero-slider__track\s*\{[^}]*display:\s*flex;[^}]*transform:\s*translate3d/s);
  assert.match(styles, /\.hero-slider__slide\s*\{[^}]*flex:\s*0 0 100%;/s);
  assert.doesNotMatch(styles, /\.hero-slider__slide\s*\{[^}]*opacity:/s);
});
