# Compact About section — 10 November 2026

The user requested a shorter About block, with a particularly strong reduction
of empty space on phones. Changes are scoped to the selected scene in
`src/site/about-scenes.css`.

Phone section padding is 32px rather than 76px. The printed photograph now has
a maximum width of 268px and smaller outer margins. The remaining space beside
its registered pencil backdrop lets the drawing fade before the story starts.
Tablet and desktop padding, photo size and stage height were also reduced.

| Viewport width | Previous section height | New section height |
| --- | ---: | ---: |
| 320 | 988px | 790px |
| 360 | 1041px | 838px |
| 393 | 1041px | 811px |
| 430 | 1086px | 807px |
| 768 | 1280px | 965px |
| 1024 | 924px | 728px |
| 1280 | 956px | 754px |
| 1716 | 1004px | 776px |

All four stories were checked in browser viewport emulation at these eight
widths and at 760/761px and 1000/1001px media boundaries. The carousel still
reserves the tallest story so that the navigation does not move. No horizontal
overflow or story text clipping was observed; photographs, copy and controls
stay inside the section. Phone body text remains 17px and controls remain 44px.

Phone, tablet and desktop screenshots were inspected. A separate agent reviewed
the 393px, 1280px and 1716px views and found no new spacing regressions. Original
photos and raster illustrations are unchanged, their registration is retained,
and human continuation opacity remains 0.1.

Build `4df166316d` passed the static site check and all 43 existing tests before
source publication. Detailed measurements and proof screenshots are retained
outside the deployment in `artifacts/compact-about-20261110/`.
