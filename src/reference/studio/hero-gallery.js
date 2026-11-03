(() => {
  const gallery = document.querySelector('[data-hero-gallery]');
  if (!gallery) return;

  const slides = [...gallery.querySelectorAll('.library-option')];
  const controls = gallery.querySelector('.hero-gallery-controls');
  const position = controls.querySelector('[data-hero-position]');
  const jumps = [...gallery.querySelectorAll('.variant-jumps a')];
  let current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    jumps.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    position.textContent = `${current + 1} / ${slides.length}`;
  }

  function readHash() {
    show(Math.max(0, slides.findIndex(slide => '#' + slide.id === location.hash)));
  }

  function select(index) {
    show(index);
    const hash = '#' + slides[current].id;
    try {
      history.replaceState(history.state, '', hash);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
      location.hash = hash;
    }
  }

  controls.querySelectorAll('[data-hero-step]').forEach(button => {
    button.addEventListener('click', () => select(current + Number(button.dataset.heroStep)));
  });
  jumps.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(index);
    });
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
        event.target.closest('input, select, textarea, [contenteditable], dialog')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    select(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  window.addEventListener('hashchange', readHash);
  readHash();
  controls.hidden = false;
})();
