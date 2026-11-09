# Pencil illustration animation

Integrated after the completed «Акценты и анимации» source commit `339eb191e89208f58f133ce68e198c9c9308cac4`. Source photographs, illustration pixels, photo registration and the existing layout choices are preserved.

`drawing-motion.js` manages the decorative lines and all 43 illustration instances, including 22 distinct raster pictures and the inline SVG artwork. Each picture draws its outer contour, shades the background with visible pencil strokes, then reveals the darker details. Interview furniture precedes the women. Paper-like pictures receive a temporary hatched paper foundation so writing appears over paper instead of the section color.

Three treatments are available in the service block: long strokes, short strokes and crosshatching. `drawing=1`, `drawing=2` and `drawing=3` select a shareable page-wide treatment. «Повторить» replays visible pictures and updates pending pictures; completed offscreen pictures stay complete. Tab buttons support arrows, Home and End.

The service drawing durations are exactly the former durations divided by three: 1013.33, 1060 and 1106.67 ms. Other illustrations take 1060 ms. The phases occupy 25%, 43% and 32% of the duration. Service pictures start 500 ms apart, including when cards enter on adjacent scroll frames; their captions start another 500 ms after the picture, with a 216.67 ms entrance. On phones, offscreen cards wait for their own viewport entry.

`pencil-renderer.js` uses SVG masks and the original artwork. Native vector illustrations are inlined by the build. `pencil-artwork-data.js` contains contours and source hashes; the asset list and semantic contour overrides live in this directory. Regenerate with Python plus Pillow and NumPy:

```powershell
python scripts/trace-pencil-artwork.py src/site docs/pencil-artwork-assets.json src/site/pencil-artwork-data.js docs/pencil-contour-overrides.json
```

About panoramas and registered photo continuations retain lazy loading and their original placement. Changing the About, pricing, form, cup or footer variants starts newly visible drawings. Original photographs never animate. No animation package or extra bitmap is added. Completed animations release their masks. Reduced motion, `motion=off` and `capture=1` show complete artwork and readable captions. Without JavaScript, the original artwork remains visible.

Browser review covers all three stroke treatments, paper/detail intermediate frames, process pictures, pricing variants, registered About scenes, lazy panoramic artwork, both cups, preserved form fields, the review book, footer family, keyboard selection and 390/320 px layouts. Test-only animation scrubbing and screenshots live outside the source checkout and are excluded from publication.
