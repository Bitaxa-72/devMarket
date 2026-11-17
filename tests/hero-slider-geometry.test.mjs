import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const component = readFileSync(new URL('../src/components/HeroSlider.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/hero-slider.css', import.meta.url), 'utf8');

test('uses a smooth scalable clip path for the desktop hero image', () => {
  assert.match(component, /clipPathUnits="objectBoundingBox"/);
  assert.match(component, /<path d="[^"]*C[^"]*"/);
  assert.match(styles, /\.hero-slider__frame\s*\{[^}]*clip-path:\s*url\(#hero-slider-frame-clip\)/s);
  assert.doesNotMatch(styles, /\.hero-slider__frame\s*\{[^}]*clip-path:\s*polygon\(/s);
});
