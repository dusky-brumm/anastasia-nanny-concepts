(() => {
  const nav = document.querySelector('.pencil-comparison');
  if (!nav) return;
  const site = nav.nextElementSibling;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => document.documentElement.style.setProperty('--comparison-offset', nav.offsetHeight + 12 + 'px')).observe(nav);
  }
  const params = new URLSearchParams(location.search);
  const links = nav.querySelectorAll('.comparison-pairs a:not(.block-compare-link)');
  // Native and reference compositions also need stable anchors after fonts load.
  const initialHash = location.hash;
  if (initialHash && !params.has('compare-scroll') && !site.matches('.early-design,.illustrated-site')) {
    const loaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
    Promise.all([loaded, document.fonts.ready]).then(() => requestAnimationFrame(() => {
      if (location.hash !== initialHash) return;
      const target = document.getElementById(initialHash.slice(1));
      if (!target || !site.contains(target)) return;
      window.scrollTo({top:window.scrollY + target.getBoundingClientRect().top - nav.offsetHeight - 24,behavior:'instant'});
    }));
  }

  const sections = [...site.querySelectorAll('[data-block][id]')];
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

})();
