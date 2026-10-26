"""Export reviewed browser captures without replacing full-page evidence."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / 'project-notes/atelier-2026-10-27'
IDS = ['01-portrait', '02-letter', '03-grid', '04-cover', '05-profile', '06-dialogue']
previews = ROOT / 'dist/atelier/previews'
screens = ROOT / 'dist/atelier/screens'
previews.mkdir(exist_ok=True)
screens.mkdir(exist_ok=True)
desktop = Image.new('RGB', (1440, 1070), '#edf0ed')
mobile = Image.new('RGB', (1200, 910), '#edf0ed')
desktop_draw, mobile_draw = ImageDraw.Draw(desktop), ImageDraw.Draw(mobile)

for index, design in enumerate(IDS):
    picture = Image.open(AUDIT / 'after' / f'{design}-desktop.png').convert('RGB')
    metadata = json.loads((AUDIT / 'after' / f'{design}-desktop.json').read_text(encoding='utf-8'))
    left = round((picture.width - 1120) / 2)
    top = round(metadata['shell']['documentY'])
    preview = picture.crop((left, top, left + 1120, top + 1050))
    preview.save(previews / f'{design}.webp', quality=87, method=6)
    picture.save(screens / f'{design}-desktop.webp', quality=86, method=6)
    x, y = index % 3 * 480 + 8, index // 3 * 535
    desktop_draw.text((x, y + 4), design, fill='#253e37')
    desktop.paste(preview.resize((464, 435), Image.Resampling.LANCZOS), (x, y + 28))
    phone = Image.open(AUDIT / 'after' / f'{design}-mobile.png').convert('RGB')
    phone.save(screens / f'{design}-mobile.webp', quality=88, method=6)
    mobile_draw.text((index * 200 + 4, 5), design, fill='#253e37')
    tile = phone.crop((0, 0, phone.width, 1600)).resize((194, 828), Image.Resampling.LANCZOS)
    mobile.paste(tile, (index * 200 + 3, 30))

desktop.save(AUDIT / 'contact-after-desktop.jpg', quality=94)
mobile.save(AUDIT / 'contact-after-mobile.jpg', quality=94)
for round_name in ['before', 'after']:
    captures = [dict(id=design, size=size, **json.loads(
        (AUDIT / round_name / f'{design}-{size}.json').read_text(encoding='utf-8')
    )) for design in IDS for size in ['desktop', 'mobile']]
    (AUDIT / f'capture-audit-{round_name}.json').write_text(
        json.dumps(captures, ensure_ascii=False, indent=2), encoding='utf-8')
print('Exported 6 previews and 12 complete screenshots; refreshed both capture audits.')
