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
    bindBlockPair(url);
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

    const requested = url.searchParams.get(part.dataset.assemblyPart);
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

function bindBlockPair(url) {
  const list = document.querySelector('[data-gallery-list]');
  const tools = document.querySelector('[data-block-pair-tools]');
  const toggle = tools.querySelector('[data-block-pair-toggle]');
  const settings = tools.querySelector('#block-pair-settings');
  const jumps = document.querySelector('[data-gallery-jumps]');
  const choices = [...tools.querySelectorAll('[data-pair-choice]')];
  const layout = tools.querySelector('[data-pair-layout]');
  const articles = [...list.querySelectorAll('[data-gallery-choice]')];
  const byChoice = new Map(articles.map(article => [article.dataset.galleryChoice,article]));
  const requested = url.searchParams.get('compare')?.split(',');
  let active = requested?.length === 2 && requested[0] !== requested[1]
    && requested.every(choice => byChoice.has(choice));
  if (active) choices.forEach((choice,index) => { choice.value = requested[index]; });
  if (url.searchParams.get('arrange') === 'stack') layout.value = 'stack';
  tools.hidden = false;
  let previous = choices.map(choice => choice.value);

  function update() {
    const selected = choices.map(choice => choice.value);
    toggle.setAttribute('aria-expanded', String(Boolean(active)));
    toggle.textContent = active ? 'Показать все варианты' : 'Сравнить два варианта';
    settings.hidden = !active;
    jumps.hidden = Boolean(active);
    list.dataset.pairLayout = active ? layout.value : 'all';
    for (const article of articles) article.hidden = active && !selected.includes(article.dataset.galleryChoice);
    const order = active ? [...selected.map(choice => byChoice.get(choice)), ...articles.filter(article => article.hidden)] : articles;
    list.append(...order);
    if (active) url.searchParams.set('compare', selected.join(','));
    else url.searchParams.delete('compare');
    if (active && layout.value === 'stack') url.searchParams.set('arrange','stack');
    else url.searchParams.delete('arrange');
    try {
      const current = new URL(location.href);
      url.hash = current.hash;
      if (active && list.querySelector(':target')?.hidden) url.hash = '';
      if (url.href !== current.href) history.replaceState(history.state, '', url);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
    }
    previous = selected;
  }

  toggle.addEventListener('click', () => {
    active = !active;
    update();
  });
  choices.forEach((select,index) => select.addEventListener('change', () => {
    const other = choices[1-index];
    if (select.value === other.value) other.value = previous[index];
    update();
  }));
  layout.addEventListener('change', update);
  update();
}
