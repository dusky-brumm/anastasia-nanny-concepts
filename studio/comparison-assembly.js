(() => {
  const url = new URL(location.href);
  const parts = [...document.querySelectorAll('[data-assembly-part]')];
  if (!parts.length) {
    const keys = [...document.querySelectorAll('[data-gallery-block]')].map(link => link.dataset.galleryBlock);
    for (const link of document.querySelectorAll('[data-try-assembly], [data-keep-assembly]')) {
      const target = new URL(link.href);
      for (const key of keys) {
        if (url.searchParams.has(key) && !target.searchParams.has(key)) {
          target.searchParams.set(key, url.searchParams.get(key));
        }
      }
      link.href = target.href;
    }
    // Old pair links now open the complete gallery without hiding any choices.
    if (url.searchParams.has('compare') || url.searchParams.has('arrange')) {
      url.searchParams.delete('compare');
      url.searchParams.delete('arrange');
      history.replaceState(history.state, '', url);
    }
    return;
  }

  const shareInput = document.querySelector('[data-assembly-url]');
  const status = document.querySelector('[data-assembly-status]');
  const cleanView = url.searchParams.get('view') === 'site';
  document.body.classList.toggle('assembly-clean-view', cleanView);
  document.querySelector('.assembly-return').hidden = !cleanView;

  function updateShareLink() {
    for (const part of parts) {
      const {assemblyPart} = part.dataset;
      url.searchParams.set(assemblyPart, part.querySelector('select').value);
    }
    url.hash = location.hash;
    shareInput.value = url.href;
    try {
      history.replaceState(history.state, '', url);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
    }
    for (const link of document.querySelectorAll('[data-assembly-gallery]')) {
      const target = new URL(link.href);
      target.search = url.search;
      link.href = target.href;
    }
    const alternate = new URL(url);
    if (cleanView) alternate.searchParams.delete('view');
    else alternate.searchParams.set('view','site');
    for (const link of document.querySelectorAll('[data-assembly-view]')) link.href = alternate.href;
  }

  for (const part of parts) {
    const select = part.querySelector('[data-assembly-choice]');
    const preview = part.querySelector('[data-assembly-preview]');
    const templates = new Map([...part.querySelectorAll('template')].map(item => [item.dataset.style,item]));
    const sections = new Map([[preview.dataset.blockStyle, preview.firstElementChild]]);
    const initial = preview.dataset.blockStyle;
    const initialReviews = preview.dataset.reviewLayout;

    function showChoice() {
      const style = select.value;
      if (preview.dataset.blockStyle === style) return;
      const template = templates.get(style);
      let section = sections.get(style);
      const isNew = !section;
      if (isNew) {
        section = template.content.firstElementChild.cloneNode(true);
        section.id = part.dataset.assemblyPart;
        sections.set(style,section);
      }
      preview.replaceChildren(section);
      document.dispatchEvent(new Event('reviews:refresh'));
      if (part.dataset.assemblyPart === 'about') document.dispatchEvent(new Event('comparison:about-changed'));
      preview.dataset.blockStyle = style;
      preview.dataset.refinement = style;
      preview.dataset.reviewLayout = style === initial ? initialReviews : template.dataset.reviews;
      if (isNew) {
        const quotes = section.querySelector('.comparison-quote-strip');
        if (quotes) bindComparisonQuotes(quotes);
        const submit = section.querySelector('.s-consult-form [type=submit]');
        if (submit) submit.disabled = false;
      }
    }

    const aliases=JSON.parse(decodeURIComponent(part.dataset.choiceAliases??'%7B%7D'));
    const stored = url.searchParams.get(part.dataset.assemblyPart);
    const requested = aliases[stored]??stored;
    if ([...select.options].some(option => option.value === requested)) select.value = requested;
    showChoice();
    select.addEventListener('change', () => {
      showChoice();
      updateShareLink();
      status.textContent = '';
    });
  }

  updateShareLink();
  window.addEventListener('hashchange', updateShareLink);
  document.querySelector('[data-copy-assembly]').addEventListener('click', async () => {
    updateShareLink();
    try {
      await navigator.clipboard.writeText(shareInput.value);
      status.textContent = 'Ссылка скопирована.';
    } catch {
      shareInput.hidden = false;
      shareInput.focus();
      shareInput.select();
      status.textContent = 'Скопируйте выделенную ссылку.';
    }
  });
})();
