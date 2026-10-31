/** Browser-local UI. Contact details are never persisted or transmitted here. */
export function formatRequest({ name, contact, service, message }) {
  return [
    'Здравствуйте, Анастасия!',
    '',
    service ? `Интересует: ${service}.` : 'Хочу обсудить подбор няни для нашей семьи.',
    `Меня зовут ${name.trim()}.`,
    `Связаться со мной: ${contact.trim()}.`,
    message.trim() ? `\nО нашей семье:\n${message.trim()}` : ''
  ].filter((line, index) => line || index === 1).join('\n');
}

export function initCommonUI({ menuButton, menu, menuMinWidth = 901, opener = 'data-dialog', closeButton = '.close-dialog', telegramUrl = 'https://t.me/anastasiadoroninaa' } = {}) {
  if (new URLSearchParams(location.search).get('embed') === '1') document.documentElement.classList.add('is-embedded');
  const toggle = menuButton && document.querySelector(menuButton);
  const navigation = menu && document.querySelector(menu);
  if (toggle && navigation) {
    const close = (returnFocus = false) => {
      navigation.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      navigation.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));
    document.addEventListener('click', event => {
      if (!navigation.hidden && !navigation.contains(event.target) && !toggle.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !navigation.hidden) close(true);
    });
    matchMedia(`(min-width: ${menuMinWidth}px)`).addEventListener('change', event => { if (event.matches) close(); });
  }

  document.querySelectorAll(`[${opener}]`).forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.getAttribute(opener));
    if (dialog && !dialog.open) dialog.showModal();
  }));
  document.querySelectorAll('dialog').forEach(dialog => {
    const heading = dialog.querySelector('h2');
    if (heading && !dialog.hasAttribute('aria-labelledby')) {
      if (!heading.id) heading.id = `${dialog.id}-title`;
      dialog.setAttribute('aria-labelledby', heading.id);
    }
    dialog.querySelector(closeButton)?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  initDraftForms(telegramUrl);
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    document.querySelectorAll('form').forEach(form => {
      const service = form.elements.namedItem('service');
      if (service) {
        service.value = link.dataset.service;
        form.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
  }));
}

function initDraftForms(telegramUrl) {
  document.querySelectorAll('.request-form, .contact-form, [data-request-form]').forEach(form => {
    if (form.dataset.draftReady) return;
    const name = form.elements.namedItem('name');
    const contact = form.elements.namedItem('contact');
    const message = form.elements.namedItem('message');
    if (!name || !contact || !message) return;
    form.dataset.draftReady = 'true';
    if (!form.elements.namedItem('service')) {
      const serviceLabel = document.createElement('label');
      serviceLabel.className = 'request-service';
      serviceLabel.textContent = 'Какая помощь вам нужна?';
      const serviceSelect = document.createElement('select');
      serviceSelect.name = 'service';
      ['Личный подбор няни', 'Личная консультация'].forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        serviceSelect.append(option);
      });
      serviceLabel.append(serviceSelect);
      form.querySelector('label')?.before(serviceLabel);
    }
    const status = form.querySelector('[role="status"]');
    const output = document.createElement('section');
    output.className = 'request-draft';
    output.hidden = true;
    output.setAttribute('aria-label', 'Подготовленная заявка');
    const title = document.createElement('h3');
    title.textContent = 'Ваша заявка готова';
    const explanation = document.createElement('p');
    explanation.textContent = 'Скопируйте текст и отправьте его Анастасии в Telegram. Форма сама ничего не отправляет.';
    const label = document.createElement('label');
    label.textContent = 'Текст сообщения';
    const text = document.createElement('textarea');
    text.readOnly = true;
    text.rows = 8;
    text.className = 'request-draft-text';
    label.append(text);
    const actions = document.createElement('div');
    actions.className = 'request-draft-actions';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'request-copy';
    copy.textContent = 'Скопировать текст';
    const telegram = document.createElement('a');
    telegram.href = telegramUrl;
    telegram.target = '_blank';
    telegram.rel = 'noopener noreferrer';
    telegram.textContent = 'Открыть Telegram ↗';
    const copyStatus = document.createElement('p');
    copyStatus.className = 'request-copy-status';
    copyStatus.setAttribute('role', 'status');
    actions.append(copy, telegram);
    output.append(title, explanation, label, actions, copyStatus);
    form.append(output);

    const invalidateDraft=event=>{
      if(output.contains(event.target))return;
      output.hidden=true;
      copyStatus.textContent='';
      if(status){status.hidden=true;status.textContent='';}
    };
    form.addEventListener('input',invalidateDraft);
    form.addEventListener('change',invalidateDraft);

    [name, contact].forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
    form.addEventListener('submit', event => {
      event.preventDefault();
      name.setCustomValidity(name.value.trim() ? '' : 'Пожалуйста, укажите ваше имя.');
      contact.setCustomValidity(contact.value.trim().length >= 3 ? '' : 'Укажите телефон или Telegram для связи.');
      if (!form.reportValidity()) return;
      text.value = formatRequest({
        name: name.value,
        contact: contact.value,
        message: message.value,
        service: form.elements.namedItem('service')?.value || ''
      });
      output.hidden = false;
      copyStatus.textContent = '';
      if (status) {
        status.textContent = 'Текст заявки подготовлен. Скопируйте его и отправьте самостоятельно.';
        status.hidden = false;
      }
      // Let CSS honor a page's motion switch as well as the system preference.
      output.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'auto', block: 'nearest' });
    });
    copy.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text.value);
        copyStatus.textContent = 'Текст скопирован. Теперь его можно вставить в Telegram.';
      } catch {
        text.focus();
        text.select();
        copyStatus.textContent = 'Текст выделен. Скопируйте его вручную: Ctrl+C или через меню телефона.';
      }
    });
    // Enable only after interception is ready. Without JS the browser must not
    // submit contact information to the static host as a default GET request.
    const submit=form.querySelector('button[type="submit"]');
    if(submit)submit.disabled=false;
  });
}
