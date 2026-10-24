"""Use actual browser captures for gallery previews and visual review sheets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
screens = root / 'project-notes' / 'screenshots'
previews = root / 'dist' / 'studio' / 'previews'
previews.mkdir(parents=True, exist_ok=True)
font_path = Path('C:/Windows/Fonts/arial.ttf')
font = ImageFont.truetype(str(font_path), 18)

for filename in sorted(screens.glob('*-preview.png')):
    with Image.open(filename) as source:
        source.convert('RGB').resize((960, 675), Image.Resampling.LANCZOS).save(
            previews / (filename.stem.removesuffix('-preview') + '.webp'), 'WEBP', quality=80)

for batch, start in enumerate(range(7, 27, 5), 1):
    ids = [p.stem.removesuffix('-preview') for p in sorted(screens.glob('*-preview.png'))
           if start <= int(p.name[:2]) < start + 5]
    if not ids:
        continue
    sheet = Image.new('RGB', (1280, 510 * ((len(ids) + 1)//2)), '#e8ece5')
    draw = ImageDraw.Draw(sheet)
    for index, concept in enumerate(ids):
        x, y = (index % 2) * 640, (index // 2) * 510
        draw.text((x+12,y+7),concept,fill='#2b443a',font=font)
        with Image.open(screens / (concept+'-preview.png')) as source:
            sheet.paste(source.convert('RGB').resize((630,443),Image.Resampling.LANCZOS),(x+5,y+35))
    sheet.save(screens / f'batch-{batch}-desktop-sheet.jpg',quality=90)

    # A full-page visual sheet keeps actual proportions, rather than hiding gaps.
    for size, width in [('desktop',320),('mobile',250)]:
        shots=[]
        for concept in ids:
            path=screens / f'{concept}-{size}.png'
            if path.exists():
                with Image.open(path) as source:
                    shots.append((concept, source.convert('RGB').resize(
                        (width,round(source.height*width/source.width)),Image.Resampling.LANCZOS)))
        if not shots:
            continue
        full=Image.new('RGB',((width+10)*len(shots),max(i.height for _,i in shots)+35),'#e8ece5')
        draw=ImageDraw.Draw(full)
        for index,(concept,shot) in enumerate(shots):
            draw.text((index*(width+10)+5,6),concept,fill='#2b443a',font=font)
            full.paste(shot,(index*(width+10)+5,35))
        full.save(screens/f'batch-{batch}-{size}-full.jpg',quality=90)
        for part, top in enumerate(range(0,full.height,1800),1):
            full.crop((0,top,full.width,min(top+1800,full.height))).save(
                screens/f'batch-{batch}-{size}-part-{part}.jpg',quality=90)

print('Prepared previews from real browser screenshots and visual review sheets.')
