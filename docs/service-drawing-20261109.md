# Service illustration drawing

Superseded by the unified controller described in [pencil-drawing-20261109.md](pencil-drawing-20261109.md). The earlier service-only controller and model below have been replaced; current drawing durations are three times faster.

The three illustrations in «Я подбираю няню под вашу семью» keep their original image files, dimensions and layout. `service-drawing-model.js` defines the hand-traced contours, clipped pencil hatching and timing. The SVG masks reveal the existing pixels instead of recoloring or replacing the artwork.

- Profile: back sheet, front sheet, portrait, notes, check.
- Notebook: binding, blank pages, writing, check, pencil.
- Interview: table and chairs, interviewer, nanny, notes.

Visible cards start after 500, 1000 and 1500 ms. Captions start another 500 ms after their picture, with a 650 ms fade and 7 px rise. On a narrow layout, only cards currently entering the viewport are scheduled; offscreen cards retain their pending mask. Completed cards never replay. Reducing motion, `motion=off` and `capture=1` show complete pictures and readable captions.

The ordinary drawing controller skips explicitly marked service SVGs. The selected-page builder bundles the new controller and its model into the existing deferred runtime. There are no added image assets, timers, animation libraries or network requests. Mask cleanup cancels the associated animations and restores the original image. Without JavaScript, original illustrations and text remain visible.

Verification: 41 tests; selected-site static and payload checks; intermediate browser frames at 1200, 2400, 3400 and 4800 ms; desktop and 390/320 px browser viewports. The mobile third card remains waiting below the viewport and starts after scrolling into view. Motion-off leaves no image masks or hidden captions. No horizontal overflow observed.

The optional scrubber is outside the source checkout in `artifacts/service-drawing-20261109/preview.mjs` and is excluded from publication.
