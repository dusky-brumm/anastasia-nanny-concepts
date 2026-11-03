(() => {
  'use strict';
  const embedded = new URLSearchParams(window.location.search).get('embed') === '1';
  if (embedded) document.documentElement.classList.add('is-embedded');
  const holder = document.querySelector('[data-rework-bar]');
  if (holder && !embedded) {
    const current = holder.dataset.reworkBar;
    const choices = [{id:'method',name:'По делу'}, {id:'photo',name:'Живой кадр'}, {id:'contrast',name:'Контраст'}];
    holder.innerHTML = '<div class="rework-bar"><div class="rework-bar-inner"><a href="../designs.html">← <span class="bar-label">Сравнить варианты</span></a><nav aria-label="Варианты дизайна">' + choices.map((c,i) => '<a href="' + c.id + '.html"' + (c.id === current ? ' aria-current="page"' : '') + '>' + (i+1) + '. ' + c.name + '</a>').join('') + '</nav></div></div>';
  }
  document.querySelectorAll('[data-menu-toggle]').forEach(button => {
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    if (!menu) return;
    const close = () => { button.setAttribute('aria-expanded','false'); menu.removeAttribute('data-open'); };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded',String(open));
      if(open) menu.setAttribute('data-open','true'); else menu.removeAttribute('data-open');
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click',close));
    document.addEventListener('keydown', event => {
      if(event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true'){close();button.focus();}
    });
  });
  document.querySelectorAll('[data-request-form]').forEach(form => {
    const result = form.parentElement.querySelector('[data-request-result]') || document.querySelector('[data-request-result]');
    if (!result) return;
    const text = result.querySelector('[data-request-text]');
    const status = result.querySelector('[data-copy-status]');
    form.querySelectorAll('[required]').forEach(input => input.addEventListener('input',() => input.setCustomValidity('')));
    form.addEventListener('input', () => { result.hidden = true; if(status) status.textContent = ''; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      for (const field of form.querySelectorAll('[required]')) field.setCustomValidity(field.value.trim() ? '' : 'Заполните это поле.');
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const name = String(values.get('name') || '').trim();
      const contact = String(values.get('contact') || '').trim();
      const message = String(values.get('message') || '').trim();
      text.value = 'Здравствуйте, Анастасия!\n\nМеня зовут ' + name + '.\nСвязаться со мной: ' + contact + '.' + (message ? '\n\nО нашей семье:\n' + message : '');
      result.hidden = false;
      if(status) status.textContent = 'Сообщение подготовлено. Скопируйте его и отправьте Анастасии в Telegram.';
      result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
      text.focus({preventScroll:true});
    });
    const copy = result.querySelector('[data-copy-message]');
    copy?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text.value); if(status)status.textContent='Текст скопирован. Теперь откройте Telegram и отправьте сообщение.'; }
      catch { text.focus();text.select();if(status)status.textContent='Текст выделен. Скопируйте его вручную и отправьте в Telegram.'; }
    });
    form.querySelectorAll('button[type="submit"]').forEach(button => {button.disabled=false;});
  });
})();
