(() => {
  const page = document.querySelector('[data-contour-direction]');
  if (!page || !('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (new URLSearchParams(location.search).get('capture') === '1') return;

  const observer = new IntersectionObserver(entries => {
    for (const {target,isIntersecting} of entries) {
      if (!isIntersecting) continue;
      target.dataset.contourMotion = 'drawn';
      observer.unobserve(target);
    }
  }, {rootMargin:'0px 0px -5% 0px',threshold:.12});

  for (const block of page.querySelectorAll(':scope > .s-block')) {
    if (!block.querySelector('.contour-drawing,.contour-transition,.s-wave-contour,.s-study-line')) continue;
    block.dataset.contourMotion = 'waiting';
    observer.observe(block);
  }
})();
