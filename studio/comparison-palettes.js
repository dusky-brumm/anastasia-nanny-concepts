(() => {
  const nav = document.querySelector('.pencil-comparison');
  if (!nav) return;
  const site = nav.nextElementSibling;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => document.documentElement.style.setProperty('--comparison-offset', nav.offsetHeight + 12 + 'px')).observe(nav);
  }
  const buttons = [...nav.querySelectorAll('[data-comparison-palette]')];
  const links = nav.querySelectorAll('.comparison-pairs a');
  const colorRoles = ['paper', 'wash', 'soft', 'ink', 'button'];
  const originalStyle = site.getAttribute('style');
  const defaultButton = '#526c73';

  function selectPalette(id, custom = {}) {
    const selected = buttons.find(button => button.dataset.comparisonPalette === id) ?? buttons[0];
    const activeId = selected.dataset.comparisonPalette;
    const overrides = activeId ? custom : {};
    const colors = activeId ? {button:defaultButton,...JSON.parse(selected.dataset.colors),...overrides} : null;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button === selected));
    if (originalStyle === null) site.removeAttribute('style');
    else site.setAttribute('style', originalStyle);
    if (colors) site.dataset.comparisonTheme = activeId;
    else site.removeAttribute('data-comparison-theme');
    if (colors) {
      for (const [role, value] of Object.entries(colors)) site.style.setProperty('--' + role, value);
      site.style.setProperty('--wine', colors.accent);
      site.style.setProperty('--pencil', colors.accent);
    }

    function withPalette(href) {
      const url = new URL(href, location.href);
      url.searchParams.delete('compare-scroll');
      url.searchParams.set('palette', activeId);
      for (const role of colorRoles) {
        if (overrides[role]) url.searchParams.set('color-' + role, overrides[role].slice(1));
        else url.searchParams.delete('color-' + role);
      }
      return url;
    }
    for (const link of links) link.href = withPalette(link.href);
    const url = withPalette(location.href);
    try {
      if (url.href !== location.href) history.replaceState(history.state, '', url);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
    }
  }

  const params = new URLSearchParams(location.search);
  const savedColors = {};
  for (const role of colorRoles) {
    const value = params.get('color-' + role);
    if (/^[\da-f]{6}$/i.test(value ?? '')) savedColors[role] = '#' + value;
  }
  selectPalette(params.get('palette') ?? nav.dataset.defaultPalette, savedColors);
  for (const button of buttons) button.addEventListener('click', () => selectPalette(button.dataset.comparisonPalette));

  const sections = [...site.querySelectorAll(':scope > [id], :scope > .pencil-section > [id]')];
  for (const link of links) {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (window.scrollY === 0) return;

      const readingLine = nav.getBoundingClientRect().bottom;
      const anchored = sections.find(item => '#' + item.id === location.hash);
      const anchorBounds = anchored?.getBoundingClientRect();
      const nearAnchor = anchorBounds && anchorBounds.bottom > readingLine
        && anchorBounds.top < window.innerHeight;
      const section = nearAnchor ? anchored : sections.find(item => item.getBoundingClientRect().bottom > readingLine);
      if (!section) return;

      const bounds = section.getBoundingClientRect();
      const progress = Math.max(0, (readingLine - bounds.top) / bounds.height);
      const destination = new URL(link.href);
      destination.hash = section.id;
      destination.searchParams.set('compare-scroll', `${section.id}:${progress.toFixed(5)}`);
      event.preventDefault();
      location.assign(destination.href);
    });
  }

  const [sectionId, progressText] = (params.get('compare-scroll') ?? '').split(':');
  const section = sections.find(item => item.id === sectionId);
  const progress = Number(progressText);
  if (section && progressText && progress >= 0 && progress <= 1) {
    // Start at the native anchor, then apply the offset after layout settles.
    const loaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
    Promise.all([loaded, document.fonts.ready]).then(() => requestAnimationFrame(() => {
      const bounds = section.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + bounds.top + bounds.height * progress - nav.offsetHeight,
        behavior: 'instant'
      });
    }));
  }

  for (const selector of ['.comparison-pairs a[aria-current]', '.comparison-palette button[aria-pressed=true]']) {
    const active = nav.querySelector(selector);
    const track = active.closest('.comparison-pairs,.comparison-palette-options');
    if (!track) continue;
    const offset = active.getBoundingClientRect().left - track.getBoundingClientRect().left;
    if (offset < 0 || offset + active.offsetWidth > track.clientWidth) {
      track.scrollLeft += offset - (track.clientWidth - active.offsetWidth) / 2;
    }
  }
})();

function bindComparisonQuotes(strip) {
    const quoteTrack = strip.querySelector('.s-review-grid');
    const controls = strip.querySelector('.comparison-quote-controls');
    const [previous, next] = controls.querySelectorAll('button');
    function updateQuoteControls() {
      const limit = quoteTrack.scrollWidth - quoteTrack.clientWidth;
      controls.hidden = limit < 4;
      previous.disabled = quoteTrack.scrollLeft < 2;
      next.disabled = quoteTrack.scrollLeft >= limit - 2;
    }
    for (const button of [previous, next]) {
      button.addEventListener('click', () => {
        const gap = parseFloat(getComputedStyle(quoteTrack).columnGap);
        const step = quoteTrack.firstElementChild.getBoundingClientRect().width + gap;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        quoteTrack.scrollBy({left:step * Number(button.dataset.quoteStep), behavior:reduced ? 'instant' : 'smooth'});
      });
    }
    quoteTrack.addEventListener('scroll', updateQuoteControls, {passive:true});
    new ResizeObserver(updateQuoteControls).observe(quoteTrack);
    updateQuoteControls();
}

document.querySelectorAll('.comparison-quote-strip').forEach(bindComparisonQuotes);
