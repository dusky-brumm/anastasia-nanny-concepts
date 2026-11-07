"""Vendor the requested Cyrillic font families from the official Google Fonts API."""
import hashlib
import json
import pathlib
import re
import urllib.parse
import urllib.request

root = pathlib.Path('src/site/typefaces')
root.mkdir(parents=True, exist_ok=True)
families = [
    ('Cormorant Garamond', 'cormorantgaramond', 'ital,wght@0,400;0,500;1,400'),
    ('Literata', 'literata', 'ital,wght@0,400;1,400'),
    ('Playfair Display', 'playfairdisplay', 'ital,wght@0,400;1,400'),
    ('Cormorant Infant', 'cormorantinfant', 'ital,wght@0,400;0,500;1,400'),
    ('Forum', 'forum', 'wght@400'),
    ('PT Serif', 'ptserif', 'ital,wght@0,400;1,400'),
    ('Spectral', 'spectral', 'ital,wght@0,400;1,400'),
    ('Onest', 'onest', 'wght@400;500;600'),
]
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}
manifest = []
styles = []
for family, directory, axes in families:
    url = 'https://fonts.googleapis.com/css2?family=' + urllib.parse.quote_plus(family + ':' + axes) + '&display=swap'
    request = urllib.request.Request(url, headers=headers)
    css = urllib.request.urlopen(request, timeout=30).read().decode()
    kept = []
    for subset, face in re.findall(r'/\* ([^*]+) \*/\s*(@font-face\s*\{[^}]+\})', css):
        if subset.strip() not in ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext']:
            continue
        remote = re.search(r'url\(([^)]+)\)', face).group(1)
        filename = directory + '-' + hashlib.sha256(remote.encode()).hexdigest()[:14] + '.woff2'
        destination = root / filename
        if not destination.exists():
            destination.write_bytes(urllib.request.urlopen(urllib.request.Request(remote, headers=headers), timeout=30).read())
        kept.append('/* ' + subset + ' */\n' + face.replace(remote, filename))
    if not kept or not any('/* cyrillic */' in face for face in kept):
        raise RuntimeError('No supported subsets returned for ' + family)
    license_url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/' + directory + '/OFL.txt'
    license_file = root / (directory + '-OFL.txt')
    license_file.write_bytes(urllib.request.urlopen(license_url, timeout=30).read())
    manifest.append({'family': family, 'cssSource': url, 'licenseSource': license_url, 'licenseFile': license_file.name, 'faces': len(kept)})
    styles.extend(kept)
(root / 'fonts.css').write_text('\n'.join(styles) + '\n', encoding='utf-8')
(root / 'sources.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'families': len(manifest), 'fontFiles': len(list(root.glob('*.woff2'))), 'bytes': sum(p.stat().st_size for p in root.glob('*.woff2'))}))
