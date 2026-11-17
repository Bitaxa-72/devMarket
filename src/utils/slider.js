export function wrapSlideIndex(index, count) {
  if (count < 1) {
    throw new RangeError('Slide count must be greater than zero');
  }

  return ((index % count) + count) % count;
}
