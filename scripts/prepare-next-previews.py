"""Export gallery images from verified, complete browser captures."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('round', type=Path)
parser.add_argument('--export', action='store_true')
args = parser.parse_args()
ids = ['01-air', '02-column', '03-practice', '04-portrait', '05-album']
dist = Path(__file__).resolve().parents[1] / 'dist' / 'next'
if args.export:
    for subdirectory in ['previews', 'screens']:
        (dist / subdirectory).mkdir(parents=True, exist_ok=True)

records = []
for size in ['desktop', 'mobile']:
    full_contact = Image.new('RGB', (1700, 2400), '#e6eae5')
    cover_contact = Image.new('RGB', (1500, 1120 if size == 'desktop' else 1000), '#e6eae5')
    full_draw, cover_draw = ImageDraw.Draw(full_contact), ImageDraw.Draw(cover_contact)
    for index, design in enumerate(ids):
        name = f'{design}-{size}'
        metadata = json.loads((args.round / f'{name}.json').read_text(encoding='utf-8'))
        sources = [args.round / f'{name}{suffix}' for suffix in ['.png', '.jpg', '.jpeg'] if (args.round / f'{name}{suffix}').exists()]
        assert len(sources) == 1, f'{name}: expected one capture, found {len(sources)}'
        image = Image.open(sources[0]).convert('RGB')
        # The browser omits the reserved 15px scrollbar gutter from capture width.
        # Full-page captures retain CSS-pixel scale and the complete DOM height.
        scale = 1
        assert 0 <= metadata['viewport']['width'] - image.width <= 15, f'{name}: unexpected capture width'
        assert abs(image.height - metadata['docHeight'] * scale) <= 2, f'{name}: incomplete capture'
        assert not metadata['overflow'], f'{name}: horizontal overflow'
        assert all(item['loaded'] for item in metadata['images']), f'{name}: unloaded photo'
        if 'fontsReady' in metadata:
            assert metadata['fontsReady'], f'{name}: required font not loaded'
        left = round(metadata['shell']['x'] * scale)
        top = round(metadata['shell']['documentY'] * scale)
        width = round(metadata['shell']['width'] * scale)
        height = round((950 if size == 'desktop' else 780) * scale)
        preview = image.crop((left, top, left + width, top + height))
        if args.export:
            preview.save(dist / 'previews' / f'{name}.webp', quality=90, method=6)
            image.save(dist / 'screens' / f'{name}.webp', quality=88, method=6)
        thumbnail = image.copy()
        thumbnail.thumbnail((324, 2290))
        full_contact.paste(thumbnail, (index * 340 + (340 - thumbnail.width) // 2, 50))
        full_draw.text((index * 340 + 12, 17), design, fill='#263f34')
        if size == 'desktop':
            tile = preview.copy()
            tile.thumbnail((475, 490))
            x, y = index % 3 * 500 + 12, index // 3 * 550 + 15
        else:
            tile = preview.copy()
            tile.thumbnail((280, 880))
            x, y = index * 300 + 10, 15
        cover_draw.text((x, y), design, fill='#263f34')
        cover_contact.paste(tile, (x, y + 28))
        records.append({'name': name, 'width': image.width, 'height': image.height, 'complete': True, 'scale': scale, 'fontsChecked': metadata.get('fontsReady', False)})
    full_contact.save(args.round / f'contact-{size}.jpg', quality=93)
    cover_contact.save(args.round / f'covers-{size}.jpg', quality=94)
(args.round / 'capture-completeness.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(f'Checked {len(records)} complete screenshots; gallery export: {args.export}')
