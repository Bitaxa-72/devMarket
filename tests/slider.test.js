import test from 'node:test';
import assert from 'node:assert/strict';
import { wrapSlideIndex } from '../src/utils/slider.js';

test('keeps an index inside the slide range', () => {
  assert.equal(wrapSlideIndex(1, 3), 1);
});

test('wraps the next index to the first slide', () => {
  assert.equal(wrapSlideIndex(3, 3), 0);
});

test('wraps the previous index to the last slide', () => {
  assert.equal(wrapSlideIndex(-1, 3), 2);
});

test('wraps indexes across multiple cycles', () => {
  assert.equal(wrapSlideIndex(7, 3), 1);
  assert.equal(wrapSlideIndex(-7, 3), 2);
});

test('rejects an empty slide collection', () => {
  assert.throws(() => wrapSlideIndex(0, 0), RangeError);
});
