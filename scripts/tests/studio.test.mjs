import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeState,readState,selectVariant,designUrl,palettes,approvedTheme} from '../../src/reference/studio/model.js';
import {studioPage,comparisonBlockChoices,comparisonDesigns,retiredDesignFiles,comparisonChoiceDetails,designBlockCoverage,isolatedDesignBlocks,comparisonChoiceAliases,transferredBlockPages,assemblyPresetChoices} from '../../src/reference/studio/pages.js';
import {extractDesignBlock} from '../../src/reference/studio/design-blocks.js';
import {additionalDesigns} from '../../src/reference/studio/additional-designs.js';
import {referenceDesigns,referenceBlockFile,referenceBlockPage} from '../../src/reference/studio/reference-designs.js';
import {illustratedDesigns} from '../../src/reference/studio/illustrated-designs.js';
import {illustratedAssets} from '../../src/reference/studio/illustrated-assets.js';
import {earlyDesigns} from '../../src/reference/studio/early-designs.js';

test('two early compositions retain their layouts, stories and local request form with added artwork',()=>{
  assert.equal(earlyDesigns.length,2);
  for(const design of earlyDesigns){
    const html=studioPage(design.mode,'hero',design.file);
    assert.match(html,/data-early-art/);
    assert.match(html,/s-pricing-summary/);
    assert.equal([...html.matchAll(/<form\b/g)].length,1);
    for(const id of Object.keys(comparisonBlockChoices)){
      assert.equal([...html.matchAll(new RegExp(`data-block="${id}"`,'g'))].length,1,`${design.mode}/${id}`);
      assert.equal(designBlockCoverage[design.mode][id],design.mode,`${design.mode}/${id} must stay selectable`);
    }
    if(design.tone==='classic'){
      assert.match(html,/s-hero--6/);
      const service=extractDesignBlock(html,'service').markup;
      assert.match(service,/Подбор няни под задачи вашей семьи/);
      assert.doesNotMatch(service,/Собеседую под вашу семью|Например, спрошу/);
      assert.match(extractDesignBlock(html,'apply').markup,/s-consult-form s-form-pencil/);
      assert.match(extractDesignBlock(html,'apply').markup,/s-apply--3/);
      assert.equal([...extractDesignBlock(html,'about').markup.matchAll(/data-about-dot=/g)].length,4);
    }else{
      assert.match(html,/s-service-personal/);
      assert.match(html,/retained-editorial-hero-for-personal\.html/);
      assert.match(extractDesignBlock(html,'about').markup,/s-letter/);
    }
  }
});

test('design 5.5 keeps the classic page and combines its process illustrations with the original arrows',()=>{
  const classic=studioPage('early-classic');
  const combined=studioPage('early-classic-arrows');
  assert.deepEqual(comparisonDesigns.map(design=>design.number),['1','2','3','4','5','5.5','6','7','8','9','11']);
  for(const id of Object.keys(comparisonBlockChoices)){
    if(id!=='process')assert.equal(extractDesignBlock(combined,id).markup,extractDesignBlock(classic,id).markup,id);
  }
  const process=extractDesignBlock(combined,'process').markup;
  assert.match(process,/<h2>Как проходит подбор<\/h2>/);
  assert.doesNotMatch(process,/Маршрут подбора|От заявки до сопровождения|Лично веду подбор/);
  for(const asset of ['13-step-application','14-step-nanny-profile','15-step-search-interview','16-step-first-meeting','17-step-support']){
    assert.match(process,new RegExp(`${asset}\\.webp`));
  }
  assert.equal([...process.matchAll(/class="classic-arrow-mobile"/g)].length,4);
  assert.match(process,/M234 216C242 172 284 139 314 164C343 189 303 194 301 156C295 105 312 83 348 68/);
  assert.match(process,/feTurbulence/);
  assert.equal(designBlockCoverage['early-classic-arrows'].hero,'early-classic');
  assert.equal(designBlockCoverage['early-classic-arrows'].process,'early-classic-arrows');
});

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
    if(!illustratedDesigns.some(design=>design.mode===mode))assert.match(html,/s-pricing-summary/);
    else {
      assert.match(html,/Один оклад няни/);
      assert.match(html,/25(?:\s|&nbsp;)*000(?:\s|&nbsp;)*₽/);
      assert.match(html,/6 месяцев/);
    }
    assert.doesNotMatch(html,/comparison-price-(?:sheet|duet)|s-clear-pricing/);
    assert.match(html,/studio\/comparison-request.js/);
    assert.doesNotMatch(html,/>Улучшенный<\/a>/);
    if(mode.endsWith('-refined'))assert.match(html,/data-refinement=/);
  }
  const reference=studioPage('comparison-reference');
  assert.equal([...reference.matchAll(/data-about-dot="/g)].length,4);
  assert.match(reference,/M389 85C395 158/);
  assert.match(studioPage('preview','hero','index.html'),/href="comparison-current-refined.html/);
});

test('chalk designs preserve all artwork, complete sections and reusable isolated compositions',()=>{
  const used=new Set();
  for(const design of illustratedDesigns){
    const html=studioPage(design.mode,'hero',design.file);
    assert.equal([...html.matchAll(/<form\b/g)].length,1);
    assert.match(html,/class="cafe-crop" viewBox="0 420 720 860"/);
    assert.doesNotMatch(html,/data:image|__ARC_ID__|github\.io\/anastasia-nanny-concepts\/#/);
    for(const asset of illustratedAssets)if(html.includes(`/${asset.id}.webp`))used.add(asset.id);
    for(const id of Object.keys(comparisonBlockChoices)){
      const selected=designBlockCoverage[design.mode][id];
      assert.equal(selected,design.mode,`${design.mode}/${id} must retain its own composition`);
      const details=comparisonChoiceDetails[id][selected];
      assert.ok(details.file,`${design.mode}/${id} needs an isolated preview`);
    }
  }
  for(const id of ['13-step-application','14-step-nanny-profile','15-step-search-interview','16-step-first-meeting','17-step-support'])assert.ok(used.has(id),id);
});

test('retired designs leave only their three requested blocks inside designs 7 and 11',()=>{
  assert.equal(referenceDesigns.length,0);
  assert.deepEqual(transferredBlockPages.map(({source,destination,block})=>[source,destination,block]),[
    ['editorial-new','early-personal','hero'],['reference-02-elliot','fotoalbum','hero'],['chalk-route','fotoalbum','process'],
  ]);
  for(const {file,html,destination,block} of transferredBlockPages){
    assert.match(studioPage(destination),new RegExp(`src="${file.replaceAll('.','\\.')}\\?v=`));
    assert.match(html,new RegExp(`id="${block}"`));
    assert.match(html,/data-reference-block-root/);
    if(block==='hero')assert.match(html,/data-reference-target="(?:apply|process)"/);
    assert.doesNotMatch(html,/href="(?:comparison-editorial|comparison-chalk-route|comparison-ref-02-elliot)\.html/);
  }
  assert.match(transferredBlockPages[0].html,/class="arch-photo"/);
  assert.match(transferredBlockPages[1].html,/class="[^"]*\blead-photo\b/);
  assert.match(transferredBlockPages[2].html,/class="s-pencil-route"/);
  for(const file of ['comparison-chalk-story.html','comparison-editorial.html','comparison-chalk-album.html','comparison-chalk-route.html','comparison-ref-02-elliot.html','comparison-ref-05-yoga.html'])assert.ok(retiredDesignFiles.includes(file),file);
});

test('retained formerly separate designs share navigation and retain the selected blocks',()=>{
  assert.equal(additionalDesigns.length,1);
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
  const heroPreview=comparisonChoiceDetails.hero.quiet.file;
  assert.ok(assembly.includes(`src="${heroPreview}?v=`));
  assert.match(isolatedDesignBlocks.find(block=>block.file===heroPreview).html,/s-hero--6/);
  assert.match(isolatedDesignBlocks.find(block=>block.file===comparisonChoiceDetails.about.quiet.file).html,/data-about-dot="3"/);
  assert.match(assembly,/option value="quiet" selected>[^<]*Знакомство в четырёх кадрах/);
  assert.match(assembly,/studio\/comparison-assembly.js/);
  assert.match(assembly,/studio\/comparison-request.js/);
  assert.match(assembly,/option value="letter" selected>[^<]*Тонкие линии/);
  assert.doesNotMatch(assembly,/Вы получите текст сообщения|s-form-note/);
  assert.doesNotMatch(assembly,/data-live-request/);
  for(const [id,[,choices]] of Object.entries(comparisonBlockChoices)){
    const gallery=studioPage('comparison-library',id,`compare-block-${id}.html`);
    assert.equal([...gallery.matchAll(/class="block-compare-choice"/g)].length,choices.length);
    assert.equal([...assembly.matchAll(new RegExp(`data-assembly-part="${id}"`,'g'))].length,1);
    for(const [style] of choices) assert.ok(gallery.includes(`&amp;${id}=${style}#${id}`));
    assert.doesNotMatch(gallery,/data-live-request/);
  }
  assert.deepEqual(comparisonBlockChoices.pricing[1].map(([style])=>style),['quiet',...earlyDesigns.map(design=>design.mode),...illustratedDesigns.map(design=>design.mode),...referenceDesigns.map(design=>design.mode)]);
});

test('withdrawn full designs preserve the two selected form layouts without dead links',()=>{
  assert.ok(!comparisonDesigns.some(({mode})=>['pencil-panorama','pencil-album','comparison-gradients'].includes(mode)));
  const gallery=studioPage('comparison-library','apply','compare-block-apply.html');
  for(const style of ['album','air']){
    const article=gallery.match(new RegExp(`data-gallery-choice="${style}"[\\s\\S]*?</article>`))[0];
    const preview=comparisonChoiceDetails.apply[style].file;
    assert.ok(article.includes(`src="${preview}?v=`));
    assert.ok(isolatedDesignBlocks.find(block=>block.file===preview).html.includes('s-form-pencil'));
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
      if(id==='header')continue;
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
      assert.ok(gallery.includes(`data-gallery-choice="${design.mode}"`));
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
    assert.match(nav,/href="compare-block-hero.html/);
    const links=[...nav.matchAll(/<a [^>]*aria-label="Дизайн (\d+(?:\.\d+)?):[^>]*>(\d+(?:\.\d+)?)<\/a>/g)];
    assert.deepEqual(links.map(link=>link[2]),comparisonDesigns.map(design=>design.number));
    assert.ok(links.every(link=>link[1]===link[2]));
    assert.doesNotMatch(nav,/<select|<details/);
    assert.equal((nav.match(/aria-current="page"/g)??[]).length,mode==='preview'?0:1);
    for(const design of comparisonDesigns){
      const file=design.single?design.file:design.file.replace('.html','-refined.html');
      assert.equal(nav.split(`href="${file}?v=`).length-1,1);
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


test('every retained design is covered in every gallery without duplicate block identities or pair controls',()=>{
  for(const [id,[,choices]] of Object.entries(comparisonBlockChoices)){
    const keys=new Set(choices.map(choice=>choice[0]));
    assert.equal(keys.size,choices.length);
    const details=comparisonChoiceDetails[id];
    assert.equal(new Set(Object.values(details).map(d=>d.identity)).size,choices.length,id);
    for(const design of comparisonDesigns){
      const key=designBlockCoverage[design.mode][id];
      assert.ok(keys.has(key),design.mode+'/'+id);
      assert.ok(details[key].sources.some(source=>source.mode===design.mode));
    }
    const html=studioPage('comparison-library',id,'compare-block-'+id+'.html');
    assert.doesNotMatch(html,/data-block-pair|data-pair-choice|Сравнить два варианта/);
  }
  for(const [key,value] of Object.entries({quiet:'album',route:'air',reference:'album'}))assert.equal(comparisonChoiceAliases.apply[key],value);
  assert.equal(comparisonBlockChoices.hero[1].length,new Set(comparisonDesigns.map(design=>designBlockCoverage[design.mode].hero)).size);
});

test('all design presets can be mixed through canonical choices and transferred heroes need only one frame',()=>{
  const presets=assemblyPresetChoices();
  assert.equal(presets.length,comparisonDesigns.length);
  for(const [index,preset] of presets.entries()){
    assert.deepEqual(preset.choices,designBlockCoverage[comparisonDesigns[index].mode]);
    assert.equal(Object.keys(preset.choices).length,9);
    for(const [id,key] of Object.entries(preset.choices))assert.ok(comparisonBlockChoices[id][1].some(choice=>choice[0]===key));
  }
  assert.equal(comparisonChoiceDetails.hero['early-personal'].file,'retained-editorial-hero-for-personal.html');
  assert.equal(comparisonChoiceDetails.hero.fotoalbum.file,'retained-elliot-hero-for-fotoalbum.html');
  assert.equal(designBlockCoverage.fotoalbum.process,designBlockCoverage['comparison-route'].process);
  for(const [id,[,choices]] of Object.entries(comparisonBlockChoices)){
    const html=studioPage('comparison-library',id);
    assert.equal([...html.matchAll(/data-pick-gallery=/g)].length,choices.length);
    for(const [key] of choices){
      const details=comparisonChoiceDetails[id][key];
      if(details.sources.length)assert.ok(details.file,`${id}/${key}: exact source preview`);
    }
  }
});

test('isolated design blocks preserve complete nested markup and all local anchor targets',()=>{
  for(const {html,block,design} of isolatedDesignBlocks){
    assert.ok(extractDesignBlock(html,block).markup.includes('id="'+block+'"'));
    for(const other of Object.keys(comparisonBlockChoices)){
      if(other!==block)assert.doesNotMatch(html,new RegExp('<(?:section|header|footer)[^>]*id="'+other+'"'));
    }
    const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
    for(const [,target] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(target),design+'/'+block+': '+target);
    assert.doesNotMatch(html,/data-design-navigation|data-site-root/);
    assert.match(html,/data-reference-block-root/);
  }
  const nested='<body><main class="native"><section id="service"><section id="nested">Inner</section>End</section><footer id="footer">Other</footer></main></body>';
  assert.equal(extractDesignBlock(nested,'service').markup,'<section id="service"><section id="nested">Inner</section>End</section>');
});
