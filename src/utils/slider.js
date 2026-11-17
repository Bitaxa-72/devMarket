export function wrapSlideIndex(index, count) {
  if (count < 1) {
    throw new RangeError('Slide count must be greater than zero');
  }

  return ((index % count) + count) % count;
}

export function normalizeLoopTrackIndex(index, count) {
  if (count < 1) {
    throw new RangeError('Slide count must be greater than zero');
  }

  if (index === 0) {
    return count;
  }

  if (index === count + 1) {
    return 1;
  }

  return index;
}
