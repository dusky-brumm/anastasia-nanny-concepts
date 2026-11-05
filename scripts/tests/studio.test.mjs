import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeState,readState,selectVariant,designUrl,palettes,approvedTheme} from '../../src/reference/studio/model.js';
import {studioPage,comparisonBlockChoices,comparisonDesigns,retiredDesignFiles} from '../../src/reference/studio/pages.js';
import {additionalDesigns} from '../../src/reference/studio/additional-designs.js';
import {referenceDesigns,referenceBlockFile,referenceBlockPage} from '../../src/reference/studio/reference-designs.js';

test('completed design comparisons retain all sections and exclude cancelled options',()=>{
  const modes=comparisonDesigns.filter(design=>!design.reference).flatMap(({mode,single})=>single?[mode]:[mode,mode+'-refined']);
  const order=['header','hero','service','about','process','pricing','reviews','apply','footer'];
  for(const mode of modes){
    const html=studioPage(mode,'hero',mode+'.html');
    const positions=order.map(id=>html.indexOf(`id="${id}"`));
    assert.ok(positions.every((position,index)=>position>=0&&(index===0||position>positions[index-1])),mode);
    assert.doesNotMatch(html,/s-family-story|История семьи|Первая кандидатка/);
    assert.match(html,/data-open-quotes/);
    assert.match(html,/studio\/review-carousel.js/);
    assert.match(html,/s-request-status/);
    assert.doesNotMatch(html,/>Вариант (2|3|4|5|6|8)<\/(?:a|option)>/);
    assert.doesNotMatch(html,/data-comparison-palette|data-color-role=|Основной сайт/);
    assert.match(html,/data-comparison-theme="almost-white"/);
    assert.match(html,/s-pricing-summary/);
    assert.doesNotMatch(html,/comparison-price-(?:sheet|duet)|s-clear-pricing/);
    assert.match(html,/studio\/comparison-request.js/);
    assert.doesNotMatch(html,/>Улучшенный<\/a>/);
    if(mode.endsWith('-refined'))assert.match(html,/data-refinement=/);
  }
  const reference=studioPage('comparison-reference');
  assert.equal([...reference.matchAll(/data-about-dot="/g)].length,4);
  assert.match(reference,/M389 85C395 158/);
  assert.match(studioPage('preview','hero','index.html'),/value="comparison-current-refined.html/);
});

test('retained reference compositions keep their layouts and the latest shared decisions',()=>{
  assert.deepEqual(referenceDesigns.map(({id})=>id),['02-elliot','05-yoga']);
  for(const design of referenceDesigns){
    const html=studioPage(design.mode,'hero',design.file);
    for(const id of ['header','hero','service','about','process','pricing','reviews','apply','footer']){
      assert.equal(html.split(`data-block="${id}"`).length-1,1,`${design.id}: ${id}`);
    }
    assert.match(html,new RegExp(`look-${design.id}`));
    assert.match(html,/Анастасия Доронина · Индивидуальный подбор нянь/);
    assert.match(html,/aria-label="Telegram"/);
    assert.match(html,/aria-label="Instagram"/);
    assert.match(html,/Собеседую/);
    assert.equal([...html.matchAll(/data-reference-story="/g)].length,4);
    assert.doesNotMatch(html,/id="about-title"|История семьи|Форму на сайте можно использовать/);
    const hero=html.match(/<section id="hero"[\s\S]*?<\/section>/)[0];
    assert.doesNotMatch(hero,/Индивидуальный подбор нян/);
    assert.match(html,/id="review-cards"/);
    assert.match(html,/reference-drawing--plane/);
    assert.match(html,/reference-drawing--calendar/);
    assert.match(html,/studio\/comparison-request.js/);
    assert.match(html,/data-comparison-site/);
  }
});

test('retained formerly separate designs share navigation and retain the selected blocks',()=>{
  assert.equal(additionalDesigns.length,4);
  for(const design of additionalDesigns){
    const html=studioPage(design.mode,'hero',design.file);
    assert.match(html,/data-design-navigation/);
    for(const option of additionalDesigns)assert.ok(html.includes(`href="${option.file}?v=`));
    const about=html.match(/<section[^>]*id="about"[\s\S]*?<\/section>/)[0];
    assert.equal([...about.matchAll(/data-about-dot=/g)].length,4);
    assert.doesNotMatch(about,/<h2\b|Давайте познакомимся/);
    assert.match(html,/Собеседую под вашу семью\./);
    assert.match(html,/data-review-layout="open"/);
    assert.match(html,/<form class="s-consult-form s-form-lines"/);
    assert.match(html,/s-footer-simple/);
    assert.doesNotMatch(html,/История семьи|история семьи|Форма подготовит текст|data-live-request|\.chatgpt\.site/);
    assert.equal([...html.matchAll(/<form\b/g)].length,1);
  }
});

test('block galleries and assembly preserve the current hero and local request workflow',()=>{
  const assembly=studioPage('comparison-assembly','hero','compare-assembly.html');
  assert.match(assembly,/s-hero--6/);
  assert.match(assembly,/data-about-dot="3"/);
  assert.match(assembly,/option value="quiet" selected>Знакомство в четырёх кадрах/);
  assert.match(assembly,/studio\/comparison-assembly.js/);
  assert.match(assembly,/studio\/comparison-request.js/);
  assert.match(assembly,/option value="letter" selected>Тонкие линии/);
  assert.doesNotMatch(assembly,/Вы получите текст сообщения|s-form-note/);
  assert.doesNotMatch(assembly,/data-live-request/);
  let total=0;
  for(const [id,[,choices]] of Object.entries(comparisonBlockChoices)){
    const gallery=studioPage('comparison-library',id,`compare-block-${id}.html`);
    assert.equal([...gallery.matchAll(/class="block-compare-choice"/g)].length,choices.length);
    assert.equal([...assembly.matchAll(new RegExp(`data-assembly-part="${id}"`,'g'))].length,1);
    for(const [style] of choices) assert.ok(gallery.includes(`&amp;${id}=${style}#${id}`));
    assert.doesNotMatch(gallery,/data-live-request/);
    total+=choices.length;
  }
  assert.equal(total,38);
  assert.deepEqual(comparisonBlockChoices.pricing[1].map(([style])=>style),['quiet',...referenceDesigns.map(design=>design.mode)]);
});

test('withdrawn full designs preserve the two selected form layouts without dead links',()=>{
  assert.ok(!comparisonDesigns.some(({mode})=>['pencil-panorama','pencil-album','comparison-gradients'].includes(mode)));
  const gallery=studioPage('comparison-library','apply','compare-block-apply.html');
  for(const [style,variant] of [['album',1],['air',2]]){
    const article=gallery.match(new RegExp(`data-gallery-choice="${style}"[\\s\\S]*?</article>`))[0];
    assert.ok(article.includes(`s-apply--${variant}`));
    assert.ok(article.includes('s-form-pencil'));
    assert.ok(article.includes(`compare-assembly.html?v=__VERSION__&amp;apply=${style}#apply`));
  }
  for(const id of Object.keys(comparisonBlockChoices)){
    const html=studioPage('comparison-library',id,`compare-block-${id}.html`);
    for(const file of retiredDesignFiles)assert.ok(!html.includes(file),file);
    assert.doesNotMatch(html,/reference-(?:01-jenny|03-josephine|04-leyla|06-maren|07-marina|08-elena)/);
  }
});

test('new designs expose eight isolated, complete blocks with working cross-section links',()=>{
  for(const design of referenceDesigns){
    for(const id of Object.keys(comparisonBlockChoices)){
      const html=referenceBlockPage(design,id);
      assert.deepEqual([...html.matchAll(/data-block="([^"]+)"/g)].map(match=>match[1]),[id]);
      assert.match(html,new RegExp(`looks/${design.id}.css`));
      assert.match(html,/reference-block-page/);
      assert.match(html,/data-fixed-theme="almost-white"/);
      assert.ok(html.includes(referenceBlockFile(design,id)));
      assert.doesNotMatch(html,/data-design-navigation|class="skip"/);
      const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
      for(const [,target] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(target),`${design.id}/${id}: ${target}`);
      const gallery=studioPage('comparison-library',id,`compare-block-${id}.html`);
      assert.ok(gallery.includes(`src="${referenceBlockFile(design,id)}?v=`));
      assert.ok(gallery.includes(`value="${design.mode}"`));
      if(id==='about')assert.equal([...html.matchAll(/data-reference-story="/g)].length,4);
      if(id==='apply')assert.match(html,/<form class="s-consult-form"/);
      if(id==='hero'&&design.id==='05-yoga')assert.match(html,/id="organic-photo"/);
    }
  }
  assert.throws(()=>referenceBlockPage(referenceDesigns[0],'unknown'),/Unknown reference block/);
});

test('the live service starts with the family interview and About keeps four slides without a block heading',()=>{
  for(const mode of ['preview','comparison-current','comparison-current-refined']){
    const html=studioPage(mode,'hero',mode==='preview'?'index.html':mode+'.html');
    const service=html.match(/<section[^>]*id="service"[\s\S]*?<\/section>/)?.[0];
    const about=html.match(/<section[^>]*id="about"[\s\S]*?<\/section>/)?.[0];
    assert.ok(service&&about,mode);
    assert.match(service,/<h2>Собеседую под вашу семью\.<\/h2>/);
    assert.match(service,/<img[^>]+src="studio\/media\/family.webp"/);
    assert.match(service,/Посмотреть пример анкеты/);
    assert.doesNotMatch(service,/s-items|Изучаю отклики/);
    assert.doesNotMatch(about,/<h2\b|Давайте познакомимся/);
    assert.equal([...about.matchAll(/data-about-dot=/g)].length,4);
    assert.equal([...about.matchAll(/<h3>/g)].length,4);
  }
});

test('the final theme is fixed and the top navigation offers only designs and block comparison',()=>{
  assert.equal(approvedTheme.id,'almost-white');
  assert.equal(approvedTheme.paper,'#fcfcfa');
  assert.equal(approvedTheme.wash,'#e7f1f6');
  assert.equal(approvedTheme.soft,'#e8efe4');
  for(const mode of ['preview',...comparisonDesigns.map(design=>design.mode)]){
    const html=studioPage(mode,'hero',mode==='preview'?'index.html':mode+'.html');
    const nav=html.match(/<nav class="(?:design-panel|pencil-comparison)"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(nav,mode);
    assert.match(nav,/data-design-navigation/);
    assert.match(nav,/href="compare-block-pricing.html/);
    for(const design of comparisonDesigns){
      const file=design.single?design.file:design.file.replace('.html','-refined.html');
      assert.equal(nav.split(`value="${file}?v=`).length-1,1);
      if(mode!=='preview')assert.equal(nav.split(`href="${file}?v=`).length-1,1);
      if(!design.single){
        assert.ok(!nav.includes(`"${design.file}?v=`));
        assert.match(studioPage(design.mode,'hero',design.file),/data-refinement=/);
      }
    }
    assert.doesNotMatch(nav,/Основной сайт|Собрать свой вариант|Выбранные блоки|Палитра|data-palette|data-comparison-palette|href="\.\//);
    assert.match(html,/data-fixed-theme="almost-white"/);
    assert.match(html,/--paper:#fcfcfa;--wash:#e7f1f6;--soft:#e8efe4/);
  }
});

test('a shared mixed design round-trips without losing any of the nine choices',()=>{
  const state={layout:'123455432',palette:'mint',font:'lora'};
  const url=new URL(designUrl('preview.html',state,'apply'),'https://example.test/');
  assert.deepEqual(readState(url.search),state);assert.equal(url.hash,'#apply');
});
test('corrupt saved state and untrusted query values safely use known choices',()=>{
  assert.deepEqual(normalizeState({layout:'9x3',palette:'<script>',font:'missing'}),{layout:'113111113',palette:'reference',font:'golos'});
  assert.deepEqual(normalizeState(null),{layout:'112111113',palette:'reference',font:'golos'});
  assert.deepEqual(readState('?layout=555555555&name=private&contact=private'),{layout:'555555555',palette:'reference',font:'golos'});
});
test('old route links change only the process block, while explicit designs take precedence',()=>{
  assert.deepEqual(readState('?route=4'),{layout:'112141113',palette:'reference',font:'golos'});
  assert.deepEqual(readState('?route=4&layout=222222222&font=lora'),{layout:'222222222',palette:'reference',font:'lora'});
  assert.deepEqual(readState('?route=999'),normalizeState(null));
});
test('changing one block preserves every other design decision',()=>{
  const original={layout:'123455432',palette:'rose',font:'prata'};
  assert.deepEqual(selectVariant(original,'pricing',2),{...original,layout:'123452432'});
  assert.equal(original.layout,'123455432');assert.deepEqual(selectVariant(original,'unknown',2),original);
});
test('all eleven hero choices have distinct slides and preserve the nine-block shared layout',()=>{
  const html=studioPage('library','hero','blocks-hero.html');
  assert.equal([...html.matchAll(/class="library-option"/g)].length,11);
  assert.match(html,/data-hero-step="-1"/);
  assert.match(html,/data-hero-step="1"/);
  assert.match(html,/studio\/hero-gallery.js/);
  for(let variant=1;variant<=11;variant++){
    const state=selectVariant(normalizeState(null),'hero',variant);
    assert.equal(state.layout[1],variant.toString(36));
    assert.equal(state.layout.length,9);
    assert.deepEqual(readState(new URL(designUrl('preview.html',state),'https://example.test/').search),state);
    assert.ok(html.includes(`id="variant-${variant}"`));
  }
});
test('the three additional process variants survive shared links and stay specific to the process block',()=>{
  for(const route of [6,7,8]){
    const state=readState('?route='+route);
    assert.equal(state.layout[4],String(route));
    assert.deepEqual(readState(new URL(designUrl('preview.html',state),'https://example.test/').search),state);
    assert.deepEqual(selectVariant(state,'header',route),state);
  }
});
test('share links contain only design choices, never request fields',()=>{
  const url=new URL(designUrl('preview.html',{name:'Anna',contact:'private',layout:'111111111'}),'https://example.test/');
  assert.deepEqual([...url.searchParams.keys()],['layout','palette','font','v']);
});
function luminance(hex){const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
test('old comparison links keep their version and an explicit version can use any palette',()=>{
  assert.equal(readState('?palette=sky-previous').version,'previous');
  for(const version of ['current','previous'])for(const palette of ['sky-previous','reference','soft-sage','blue-mist']){
    const state=normalizeState({version,palette});
    const url=new URL(designUrl('preview.html',state),'https://example.test/');
    assert.deepEqual(readState(url.search),state);
  }
});
test('palettes keep body and accent text readable on all three page backgrounds',()=>{
  for(const p of palettes)for(const foreground of [p.ink,p.accent])for(const background of [p.paper,p.wash,p.soft]){
    const ratio=(Math.max(luminance(foreground),luminance(background))+.05)/(Math.min(luminance(foreground),luminance(background))+.05);
    assert.ok(ratio>=4.5,`${p.id}: contrast ${ratio.toFixed(2)}`);
  }
  for(const p of palettes)assert.ok(1.05/(luminance(p.button??p.ink)+.05)>=4.5,p.id);
});
