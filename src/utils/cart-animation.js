function getVisibleCart() {
  return [...document.querySelectorAll('.header__cart, .header__mobile-cart')].find((element) => {
    const rect = element.getBoundingClientRect();
    return element.getClientRects().length && rect.width > 0 && rect.height > 0;
  });
}

export function animateProductToCart(source, product) {
  const target = getVisibleCart();
  if (!source || !target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const flyer = document.createElement('div');
  const mark = document.createElement('span');
  const title = document.createElement('span');
  const startX = sourceRect.left + sourceRect.width / 2 - 82;
  const startY = sourceRect.top + Math.min(sourceRect.height / 2, 80) - 24;
  const targetX = targetRect.left + targetRect.width / 2 - 82;
  const targetY = targetRect.top + targetRect.height / 2 - 24;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;
  const arcY = deltaY * 0.42 - Math.min(130, Math.max(70, Math.abs(deltaY) * 0.2));

  flyer.className = 'cart-flyer';
  mark.className = 'cart-flyer__mark';
  title.className = 'cart-flyer__title';
  mark.textContent = 'D';
  title.textContent = product.title;
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.append(mark, title);
  document.body.append(flyer);

  const flight = flyer.animate([
    { opacity: 0, transform: 'translate3d(0, 10px, 0) scale(.82)' },
    { offset: 0.12, opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
    { offset: 0.62, opacity: 1, transform: `translate3d(${deltaX * 0.62}px, ${arcY}px, 0) scale(.76) rotate(-5deg)` },
    { opacity: 0.25, transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(.18) rotate(8deg)` },
  ], { duration: 720, easing: 'cubic-bezier(.22,.72,.22,1)', fill: 'forwards' });

  window.setTimeout(() => {
    target.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.2)' },
      { transform: 'scale(.96)' },
      { transform: 'scale(1)' },
    ], { duration: 360, easing: 'ease-out' });
  }, 540);

  flight.finished.finally(() => flyer.remove());
}
