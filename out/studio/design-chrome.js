import {headerSocials} from './render.js?v=7243f4a467';

export function sharedDesignHeader(){
  const links=headerSocials+[['service','О подборе'],['about','Обо мне'],['process','Этапы'],['pricing','Стоимость'],['reviews','Отзывы']].map(([id,label])=>`<a href="#${id}">${label}</a>`).join('');
  return `<header id="header" data-block="header" class="design-site-header">
    <a class="design-site-brand" href="#hero">Анастасия Доронина · Индивидуальный подбор нянь</a>
    <nav class="design-site-links" aria-label="Меню сайта">${links}</nav>
    <details class="design-site-menu"><summary aria-label="Открыть меню"><span></span><span></span><span></span></summary><nav aria-label="Меню сайта">${links}</nav></details>
  </header>`;
}

export function withoutRepeatedHeroLabel(markup){
  return markup.replace(/<p\b[^>]*>\s*(?:Индивидуальный подбор нян[ьиь]|Анастасия Доронина\s*[·—]\s*личный подбор нян[ьиь])\s*<\/p>/gi,'').replace(/^[\t ]+$/gm,'');
}
