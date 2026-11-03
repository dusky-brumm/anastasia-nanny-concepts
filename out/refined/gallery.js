(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-device]')];
  const windows = [...document.querySelectorAll('.preview-window')];
  let mode = 'desktop';
  const resize = () => windows.forEach(win => {
    const frame = win.querySelector('iframe');
    const width = mode === 'mobile' ? 390 : 1120;
    const scale = win.clientWidth / width;
    frame.style.width = width + 'px';
    frame.style.height = Math.ceil(win.clientHeight / scale) + 'px';
    frame.style.transform = 'scale(' + scale + ')';
  });
  buttons.forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.device;
    document.body.dataset.device = mode;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    resize();
  }));
  if ('ResizeObserver' in window) { const observer = new ResizeObserver(resize); windows.forEach(win => observer.observe(win)); }
  window.addEventListener('resize', resize);
  resize();
})();
