"""Publish lightweight screenshots from reviewed browser captures (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

root=Path(__file__).resolve().parents[1]
audit=root/'project-notes'/'curation-2026-10-26'
output=root/'dist'/'final'
catalog=(root/'dist'/'studio'/'catalog.js').read_text(encoding='utf-8')
entries=json.loads(catalog.split('export default ',1)[1].rstrip(';\n'))
finals=[entry for entry in entries if entry['edition']=='curated']
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',19)
for folder in ['previews','screens','sets']:(output/folder).mkdir(exist_ok=True)

for entry in finals:
    for size in ['desktop','mobile']:
        with Image.open(audit/'after'/f'{entry["id"]}-{size}.jpg') as im:
            im.convert('RGB').save(output/'screens'/f'{entry["id"]}-{size}.webp',quality=80,method=4)
            if size=='desktop':
                hero=im.crop((0,0,im.width,min(900,im.height)))
                hero.save(audit/'after'/f'{entry["id"]}-hero.jpg',quality=95)
                hero.save(output/'previews'/f'{entry["id"]}.webp',quality=88,method=4)

for stage,batches,prefix in [('after',[finals[:5],finals[5:10],finals[10:]],'set'),
    ('before',[[e for e in entries if e['edition']=='archive' and start<=e['number']<end] for start,end in [(1,7),(7,12),(12,17),(17,22),(22,27)]],'before')]:
    for number,batch in enumerate(batches,1):
        batch.sort(key=lambda entry:entry['number'])
        sheet=Image.new('RGB',(1280,490*((len(batch)+1)//2)),'#e9e7e3')
        draw=ImageDraw.Draw(sheet)
        for index,entry in enumerate(batch):
            x=index%2*640;y=index//2*490
            draw.text((x+12,y+6),f'{entry["number"]:02} / {entry["name"]}',fill='#29252a',font=font)
            with Image.open(audit/stage/f'{entry["id"]}-desktop.jpg') as im:
                hero=im.crop((0,0,im.width,min(900,im.height))).convert('RGB')
                hero.thumbnail((630,448),Image.Resampling.LANCZOS)
                sheet.paste(hero,(x+5,y+34))
        sheet.save(output/'sets'/f'{prefix}-{number}.jpg',quality=92)
        sheet.save(audit/f'{stage}-set-{number}.jpg',quality=92)
print('Prepared 15 desktop/mobile screenshot pairs, previews and all before/after sets.')
