import {surfaceVersions,surfaceVersion} from './surface-study-model.js';

// Texture comparisons reuse the original cards and form, including entered values.
const surfaceRoot=document.documentElement;
let surfaceBar;
function chooseSurface(value){
 const version=surfaceVersion(value??'original');
 if(!version){delete surfaceRoot.dataset.textureStudy;surfaceBar?.remove();surfaceBar=null;return;}
 surfaceRoot.dataset.textureStudy=version.id;
 if(!surfaceBar){
  surfaceBar=document.createElement('nav');
  surfaceBar.className='surface-study-bar';
  surfaceBar.setAttribute('aria-label','Сравнение фактур');
  surfaceBar.innerHTML='<span class="surface-study-caption">Форма и отзывы</span><div class="surface-study-choices" role="group" aria-label="Выбрать версию"></div><span class="surface-study-name" aria-live="polite"></span><div class="surface-study-jumps"><a href="#apply">Заявка</a><a href="#reviews">Отзывы</a></div><button class="surface-study-close" type="button" aria-label="Закрыть сравнение и вернуться к основному сайту">×</button>';
  const group=surfaceBar.querySelector('.surface-study-choices');
  surfaceVersions.forEach((item,index)=>{
   const button=document.createElement('button');
   button.type='button';button.textContent=String(index+1);button.dataset.textureChoice=item.id;
   button.setAttribute('aria-label',`Вариант ${index+1}: ${item.name}`);button.title=item.detail;
   group.append(button);
  });
  const masks=document.createElementNS('http://www.w3.org/2000/svg','svg');
  masks.classList.add('surface-study-masks');masks.setAttribute('aria-hidden','true');masks.setAttribute('focusable','false');
  masks.innerHTML='<defs><filter id="surface-study-grain-contrast" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR data-study-contrast type="linear" slope="3" intercept="-2"/><feFuncG data-study-contrast type="linear" slope="3" intercept="-2"/><feFuncB data-study-contrast type="linear" slope="3" intercept="-2"/></feComponentTransfer></filter><mask id="surface-study-paper-grain" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1" style="mask-type:luminance"><image data-study-grain x="-.05" y="-.2" width="1.1" height="1.4" preserveAspectRatio="none" filter="url(#surface-study-grain-contrast)"/></mask></defs>';
  surfaceBar.append(masks);
  document.body.prepend(surfaceBar);
  surfaceBar.addEventListener('click',event=>{
   const button=event.target.closest('[data-texture-choice]');
   const close=event.target.closest('.surface-study-close');
   if(!button&&!close)return;
   const id=button?.dataset.textureChoice??'off',url=new URL(location.href);
   url.searchParams.set('texture',id);
   history.replaceState(null,'',url);
   chooseSurface(id);
  });
 }
 // Reuse the generated strokes as white pigment, with visible paper gaps.
 const grain=surfaceBar.querySelector('[data-study-grain]');
 if(version.id==='original')grain.removeAttribute('href');
 else grain.setAttribute('href',`media/surface-studies-20261110/form-${version.id}.webp`);
 const contrast=version.id==='green'?2:3;
 for(const channel of surfaceBar.querySelectorAll('[data-study-contrast]')){
  channel.setAttribute('slope',String(contrast));channel.setAttribute('intercept',String(1-contrast));
 }
 for(const button of surfaceBar.querySelectorAll('[data-texture-choice]'))button.setAttribute('aria-pressed',String(button.dataset.textureChoice===version.id));
 surfaceBar.querySelector('.surface-study-name').textContent=version.name;
}
const restoreSurface=()=>chooseSurface(new URLSearchParams(location.search).get('texture'));
addEventListener('popstate',restoreSurface);
restoreSurface();
