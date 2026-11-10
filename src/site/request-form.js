// This function is bundled without imports into the final page runtime.
export function bindSiteRequestUi(formatRequest) {
  const endpoint = document.body.dataset.requestEndpoint;
  const pending = new WeakSet();
  document.querySelectorAll('.s-consult-form [type=submit]').forEach(button => { button.disabled = false; });
  if (endpoint) {
    const privacy = document.querySelector('#studio-privacy p');
    if (privacy) privacy.textContent = 'При нажатии «Оставить заявку» имя, контакт и текст запроса передаются Анастасии через Telegram-бота. Отдельная база заявок на сайте не ведётся.';
  }
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!form.matches('.s-consult-form')) return;
    event.preventDefault();
    if (pending.has(form)) return;
    const fields = ['name', 'contact', 'message'].map(key => form.elements.namedItem(key));
    const [name, contact, message] = fields;
    name.setCustomValidity(name.value.trim() ? '' : 'Укажите ваше имя.');
    contact.setCustomValidity(contact.value.trim().length >= 3 ? '' : 'Укажите телефон или Telegram для связи.');
    if (!form.reportValidity()) return;
    const application = {name: name.value, contact: contact.value, message: message.value, website: ''};
    const destination = new URL('https://t.me/inyfid');
    destination.searchParams.set('text', formatRequest(application));
    if (!endpoint) {
      window.open(destination.href, '_blank', 'noopener,noreferrer');
      return;
    }
    const submit = form.querySelector('[type=submit]');
    const label = submit.firstChild;
    const originalLabel = label.textContent;
    const status = form.querySelector('[role=status]');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    pending.add(form);
    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    fields.forEach(field => { field.readOnly = true; });
    label.textContent = 'Отправляем… ';
    status.textContent = '';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(application),
        credentials: 'same-origin',
        signal: controller.signal,
      });
      if (response.ok && (await response.json()).ok === true) {
        form.reset();
        status.textContent = 'Заявка отправлена. Анастасия свяжется с вами.';
        return;
      }
      status.textContent = response.status === 429
        ? 'Слишком много попыток. Попробуйте через минуту или напишите лично.'
        : 'Не удалось подтвердить отправку. Попробуйте ещё раз или напишите лично.';
    } catch {
      status.textContent = 'Не удалось подтвердить отправку. Попробуйте ещё раз или напишите лично.';
    } finally {
      clearTimeout(timeout);
      pending.delete(form);
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      fields.forEach(field => { field.readOnly = false; });
      label.textContent = originalLabel;
    }
    const link = document.createElement('a');
    link.href = destination.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 's-text-link';
    link.textContent = 'Отправить в Telegram ↗';
    status.append(' ', link);
  });
  document.addEventListener('input', event => {
    const form = event.target.closest('.s-consult-form');
    if (!form || pending.has(form)) return;
    form.elements.namedItem('name').setCustomValidity('');
    form.elements.namedItem('contact').setCustomValidity('');
    form.querySelector('[role=status]').textContent = '';
  });
}
