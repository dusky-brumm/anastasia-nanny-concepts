(() => {
  const url = new URL(location.href);
  const parts = [...document.querySelectorAll('[data-assembly-part]')];
  const storageKey='nastya-block-selection-v1';
  const keys=parts.length?parts.map(part=>part.dataset.assemblyPart):[...document.querySelectorAll('[data-gallery-block]')].map(link=>link.dataset.galleryBlock);
  if(!keys.some(key=>url.searchParams.has(key))){
    try{
      const saved=JSON.parse(localStorage.getItem(storageKey)??'{}');
      for(const key of keys)if(typeof saved?.[key]==='string')url.searchParams.set(key,saved[key]);
    }catch{/* Shared URLs still work when browser storage is unavailable. */}
  }
  function saveChoices(){
    try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(keys.filter(key=>url.searchParams.has(key)).map(key=>[key,url.searchParams.get(key)]))));}catch{}
  }
  if (!parts.length) {
    const gallery=document.querySelector('[data-gallery-list]');
    if(!gallery)return;
    const options=JSON.parse(decodeURIComponent(gallery.dataset.galleryOptions));
    const aliases=JSON.parse(decodeURIComponent(gallery.dataset.galleryAliases));
    const current=gallery.dataset.galleryCurrent;
    const status=document.querySelector('[data-gallery-status]');
    const toolbar=document.querySelector('.block-gallery-selection');
    if('ResizeObserver' in window)new ResizeObserver(()=>document.documentElement.style.setProperty('--gallery-toolbar-height',toolbar.offsetHeight+'px')).observe(toolbar);
    for(const key of keys){
      const requested=url.searchParams.get(key);
      const canonical=aliases[key]?.[requested]??requested;
      if(options[key].includes(canonical))url.searchParams.set(key,canonical);
      else url.searchParams.delete(key);
    }
    url.searchParams.delete('compare');
    url.searchParams.delete('arrange');
    function updateGallery(){
      for(const link of document.querySelectorAll('[data-try-assembly], [data-keep-assembly], [data-gallery-block]')){
        const target=new URL(link.href);
        const forcedKey=link.dataset.tryAssembly;
        const forcedChoice=forcedKey?link.closest('[data-gallery-choice]').dataset.galleryChoice:null;
        for(const key of keys){
          target.searchParams.delete(key);
          if(url.searchParams.has(key))target.searchParams.set(key,url.searchParams.get(key));
        }
        if(forcedKey)target.searchParams.set(forcedKey,forcedChoice);
        link.href=target.href;
      }
      for(const card of gallery.querySelectorAll('[data-gallery-choice]')){
        const selected=card.dataset.galleryChoice===url.searchParams.get(current);
        card.classList.toggle('is-selected',selected);
        const button=card.querySelector('[data-pick-gallery]');
        button.setAttribute('aria-pressed',String(selected));
        button.textContent=selected?'Выбрано ✓':'Выбрать блок';
      }
      const count=keys.filter(key=>url.searchParams.has(key)).length;
      status.textContent=`Выбрано ${count} из ${keys.length}`;
      document.querySelector('[data-clear-gallery]').disabled=count===0;
      history.replaceState(history.state,'',url);
      saveChoices();
    }
    for(const button of gallery.querySelectorAll('[data-pick-gallery]'))button.addEventListener('click',()=>{
      url.searchParams.set(current,button.dataset.pickGallery);
      updateGallery();
    });
    document.querySelector('[data-gallery-category]').addEventListener('change',event=>{
      location.assign(document.querySelector(`[data-gallery-block="${event.target.value}"]`).href);
    });
    document.querySelector('[data-clear-gallery]').addEventListener('click',()=>{
      for(const key of keys)url.searchParams.delete(key);
      updateGallery();
    });
    updateGallery();
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
    saveChoices();
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
