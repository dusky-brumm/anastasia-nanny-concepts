(() => {
  const nav = document.querySelector('.pencil-comparison');
  if (!nav) return;
  const site = nav.nextElementSibling;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => document.documentElement.style.setProperty('--comparison-offset', nav.offsetHeight + 12 + 'px')).observe(nav);
  }
  const buttons = [...nav.querySelectorAll('[data-comparison-palette]')];
  const links = nav.querySelectorAll('a');
  const inputs = [...nav.querySelectorAll('[data-color-role]')];
  const hint = nav.querySelector('[data-color-hint]');
  const originalStyle = site.getAttribute('style');
  const defaultButton = '#526c73';
  let activeId = '';
  let overrides = {};

  function selectPalette(id, custom = {}) {
    const selected = buttons.find(button => button.dataset.comparisonPalette === id) ?? buttons[0];
    activeId = selected.dataset.comparisonPalette;
    overrides = activeId ? custom : {};
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
    const computed = getComputedStyle(site);
    for (const input of inputs) {
      const role = input.dataset.colorRole;
      const original = role === 'button'
        ? getComputedStyle(site.querySelector('#hero .s-button')).backgroundColor
        : computed.getPropertyValue('--' + role).trim();
      const rgb = original.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      const hex = rgb ? '#' + rgb.slice(1).map(value => Number(value).toString(16).padStart(2,'0')).join('') : original;
      input.disabled = !colors;
      input.value = colors?.[role] ?? hex;
      input.nextElementSibling.textContent = input.value.toUpperCase();
    }
    hint.hidden = Boolean(colors);

    function withPalette(href) {
      const url = new URL(href, location.href);
      if (colors) url.searchParams.set('palette', selected.dataset.comparisonPalette);
      else url.searchParams.delete('palette');
      for (const input of inputs) {
        const role = input.dataset.colorRole;
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
  for (const input of inputs) {
    const role = input.dataset.colorRole;
    const value = params.get('color-' + role);
    if (/^[\da-f]{6}$/i.test(value ?? '')) savedColors[role] = '#' + value;
    input.addEventListener('input', () => selectPalette(activeId, {...overrides,[role]:input.value}));
  }
  selectPalette(params.get('palette'), savedColors);
  for (const button of buttons) button.addEventListener('click', () => selectPalette(button.dataset.comparisonPalette));
})();
