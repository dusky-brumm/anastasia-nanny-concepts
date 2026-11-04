/* Shared by the live page, comparisons and the block assembler. No autoplay. */
const quoteBindings = new Map();
function bindComparisonQuotes(strip) {
  if (quoteBindings.has(strip)) {
    quoteBindings.get(strip).update();
    return;
  }
  const track = strip.querySelector('.s-review-grid');
  const controls = strip.querySelector('.comparison-quote-controls');
  if (!track || !controls) return;
  const previous = controls.querySelector('[data-quote-step="-1"]');
  const next = controls.querySelector('[data-quote-step="1"]');
  const position = controls.querySelector('.comparison-quote-position');
  const cards = [...track.children];
  const controller = new AbortController();
  function stepSize() {
    return cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  }
  function update() {
    if (!track.isConnected || !track.clientWidth) return;
    const limit = track.scrollWidth - track.clientWidth;
    controls.hidden = limit < 4;
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= limit - 2;
    const first = Math.round(track.scrollLeft / stepSize()) + 1;
    const count = Math.max(1, Math.round((track.clientWidth + (parseFloat(getComputedStyle(track).columnGap) || 0)) / stepSize()));
    const last = Math.min(cards.length, first + count - 1);
    const label = `${first === last ? first : `${first}–${last}`} из ${cards.length}`;
    if (position.textContent !== label) position.textContent = label;
  }
  function move(left) {
    track.scrollTo({left, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  for (const button of [previous, next]) {
    button.addEventListener('click', () => move(track.scrollLeft + stepSize() * Number(button.dataset.quoteStep)), {signal:controller.signal});
  }
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const destination = event.key === 'Home' ? 0 : event.key === 'End' ? track.scrollWidth : track.scrollLeft + stepSize() * (event.key === 'ArrowRight' ? 1 : -1);
    move(destination);
  }, {signal:controller.signal});
  track.addEventListener('scroll', update, {passive:true, signal:controller.signal});
  let previousStep = stepSize();
  const observer = new ResizeObserver(() => {
    const nextStep = stepSize();
    if (previousStep > 0 && Math.abs(nextStep - previousStep) > 1) {
      const index = Math.round(track.scrollLeft / previousStep);
      track.scrollTo({left:index * nextStep, behavior:'instant'});
    }
    previousStep = nextStep;
    update();
  });
  observer.observe(track);
  quoteBindings.set(strip, {update, destroy(){observer.disconnect();controller.abort();}});
  update();
}
function refreshReviewCarousels() {
  for (const [strip, binding] of quoteBindings) {
    if (!strip.isConnected) {
      binding.destroy();
      quoteBindings.delete(strip);
    }
  }
  document.querySelectorAll('.comparison-quote-strip').forEach(bindComparisonQuotes);
}
document.addEventListener('reviews:refresh', refreshReviewCarousels);
refreshReviewCarousels();
