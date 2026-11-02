import test from 'node:test';
import assert from 'node:assert/strict';
import {metadataFor,seoConfig,seoHead,serviceGraph,publicUrl,sitemapXml} from '../../src/reference/studio/seo.js';
import {studioPage} from '../../src/reference/studio/pages.js';

test('only the service home is indexable; public URLs retain the GitHub project path',()=>{
  for(const file of ['index.html','studio.html','preview.html','routes.html','blocks.html','blocks-process.html']){
    const m=metadataFor(file);
    assert.equal(m.robots.includes('noindex'),file!=='index.html');
    assert.ok(m.canonical.startsWith(seoConfig.url));
    assert.equal(new URL(m.canonical).search,'');assert.equal(new URL(m.canonical).hash,'');
  }
  assert.equal(metadataFor('index.html').canonical,seoConfig.url);
  assert.equal(publicUrl('assets/social-card.png'),seoConfig.url+'assets/social-card.png');
});

test('structured data describes the actual person and service without invented local business claims',()=>{
  const graph=serviceGraph()['@graph'];
  const person=graph.find(n=>n['@type']==='Person'),service=graph.find(n=>n['@type']==='Service'),page=graph.find(n=>n['@type']==='WebPage');
  assert.equal(person.name,'Анастасия Доронина');assert.equal(service.provider['@id'],person['@id']);
  assert.equal(page.mainEntity['@id'],service['@id']);assert.equal(page.url,seoConfig.url);
  assert.equal(service.areaServed,seoConfig.areaServed??undefined);
  assert.ok(!graph.some(n=>n['@type']==='LocalBusiness'));
  assert.ok(!service.aggregateRating);assert.ok(!service.offers);
});

test('metadata is safely escaped and design pages have no service rich-data graph',()=>{
  const head=seoHead('preview.html',{title:'Пример " & <метки>',description:'<script>пример</script>'});
  assert.ok(head.includes('Пример &quot; &amp; &lt;метки&gt;'));
  assert.ok(head.includes('&lt;script&gt;пример&lt;/script&gt;'));
  assert.ok(!head.includes('application/ld+json'));
  const main=seoHead('index.html');
  assert.ok(main.includes('application/ld+json'));assert.ok(main.includes('summary_large_image'));
  assert.ok(!sitemapXml().includes('studio.html'));
});

test('the indexable HTML includes nine sections, one approved H1 and readable FAQ without JavaScript',()=>{
  const html=studioPage('preview','hero','index.html');
  assert.equal((html.match(/data-block="/g)||[]).length,9);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('Найду няню, с\u00a0которой'));
  assert.ok(html.includes('Сколько стоит подбор няни?'));
  assert.ok(html.includes('одному месячному окладу выбранной няни'));
  assert.ok(html.includes('Гарантия бесплатной замены действует шесть месяцев'));
});
