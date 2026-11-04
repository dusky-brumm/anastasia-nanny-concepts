import {addPaletteSelect,applyComparisonPalette,setPaletteUrl} from '../studio/theme-controls.js';

(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-device]')];
  const windows = [...document.querySelectorAll('.preview-window')];
  const frames=windows.map(win=>win.querySelector('iframe'));
  const links=[...document.querySelectorAll('a[href^="refined/"]')];
  const applyPalette=value=>{
    for(const frame of frames){
      if(frame.contentDocument)applyComparisonPalette(frame.contentDocument,value);
    }
    links.forEach(link=>{
      link.href=setPaletteUrl(new URL(link.href),value).href;
    });
    history.replaceState(null,'',setPaletteUrl(new URL(location.href),value));
  };
  const palette=addPaletteSelect(document.querySelector('.collection-controls'),applyPalette);
  for(const frame of frames)frame.addEventListener('load',()=>{
    if(frame.contentDocument)applyComparisonPalette(frame.contentDocument,palette.value);
  });
  if(palette.value)applyPalette(palette.value);
  let mode = window.matchMedia('(max-width:650px)').matches ? 'mobile' : 'desktop';
  const updateDevice = () => {
    document.body.dataset.device = mode;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === mode)));
    resize();
  };
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
    updateDevice();
  }));
  if ('ResizeObserver' in window) { const observer = new ResizeObserver(resize); windows.forEach(win => observer.observe(win)); }
  window.addEventListener('resize', resize);
  updateDevice();
})();
