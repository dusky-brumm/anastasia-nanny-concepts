"""Static checks for local assets, anchors, forms and generated concept pages."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[1]/'dist'

class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.links=[];self.assets=[];self.labels=[];self.controls=[];self.h1=0;self.errors=[];self.in_select=False;self.in_option=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='select':self.in_select=True
        if tag=='option':self.in_option=True
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        if tag in ('a','use') and 'href' in a:self.links.append(a['href'])
        if tag in ('img','script','iframe') and 'src' in a:self.assets.append(a['src'])
        if tag=='link' and a.get('rel') in ('stylesheet','icon'):self.assets.append(a.get('href',''))
        if tag=='label' and 'for' in a:self.labels.append(a['for'])
        if tag=='img':
            if 'alt' not in a:self.errors.append('Image lacks alt attribute')
            if not a.get('width','').isdigit() or not a.get('height','').isdigit():self.errors.append('Image lacks intrinsic dimensions')
        if tag=='button' and a.get('type')=='submit' and 'disabled' not in a:
            self.errors.append('Static request form must remain disabled until local draft handling is ready')
        if a.get('target')=='_blank' and 'noopener' not in a.get('rel',''):self.errors.append('External new tab lacks noopener')
        if 'aria-controls' in a:self.controls.extend(a['aria-controls'].split())
    def handle_endtag(self,tag):
        if tag=='option':self.in_option=False
        if tag=='select':self.in_select=False
    def handle_data(self,data):
        if self.in_select and not self.in_option and data.strip():
            self.errors.append('Select contains text outside an option')

pages=list(ROOT.rglob('*.html'))
for filename in pages:
    page=Page();page.feed(filename.read_text(encoding='utf-8'))
    assert page.h1==1,f'{filename}: expected exactly one H1'
    assert all(count==1 for count in Counter(page.ids).values()),f'{filename}: duplicate IDs'
    assert set(page.labels+page.controls).issubset(page.ids),f'{filename}: unresolved label or control'
    assert not page.errors,f'{filename}: {page.errors}'
    for url in page.assets+page.links:
        parsed=urlsplit(url)
        if parsed.scheme or parsed.netloc:continue
        if not parsed.path:
            if parsed.fragment:assert unquote(parsed.fragment) in page.ids,f'{filename}: broken #{parsed.fragment}'
            continue
        target=(filename.parent/unquote(parsed.path)).resolve()
        assert target.is_relative_to(ROOT.resolve()),f'{filename}: local reference escapes dist'
        assert target.is_file(),f'{filename}: missing {url}'
        if url in page.assets:assert target.stat().st_size>0,f'{filename}: empty asset {url}'
        if parsed.fragment and target.suffix=='.html':
            linked=Page();linked.feed(target.read_text(encoding='utf-8'))
            assert parsed.fragment in linked.ids,f'{filename}: missing fragment {url}'

for filename in ROOT.rglob('*.js'):
    source=filename.read_text(encoding='utf-8')
    for specifier in re.findall(r'''\bfrom\s+['"]([^'"]+)['"]''',source):
        if specifier.startswith('.'):
            assert (filename.parent/specifier).is_file(),f'{filename}: unresolved module {specifier}'

for filename in ROOT.rglob('*.css'):
    source=re.sub(r'/\*.*?\*/','',filename.read_text(encoding='utf-8'),flags=re.S)
    source=re.sub(r'''"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*' ''','',source,flags=re.X)
    depth=0
    for token in source:
        if token=='{':depth+=1
        if token=='}':depth-=1
        assert depth>=0,f'{filename}: stray closing brace'
    assert depth==0,f'{filename}: unbalanced CSS blocks'
print(f'PASS: {len(pages)} HTML pages, local links/assets/modules, labels, image dimensions and CSS block structure.')
