# Selected book4 and matched cups with background pencil strokes

The user selected the fourth guestbook and requested light background hatching
behind both the book and the cups, with the cups matching the drawings above.

The exact book4 bitmap is retained. It is fixed as the only live review book;
the comparison controls/controller and inactive drawing dependencies are removed
from deployment. Old `book` query values do not override the selected drawing.
Previous source assets remain available as archives.

The cups were redrawn with the built-in ImageGen edit tool, using the current
two cups/book composition as target and the interview/first-meeting drawings as
style references. Broken colored-pencil outlines, blue/sage dry-crayon hatching
and milk fills replace the cleaner previous cup outlines. The two cups, saucers
and small open book remain. The original PNG and exact prompt are retained in
`artifacts/book-cups-hatching-20261110/`; delivery uses WebP with unchanged
1774×887 dimensions and alpha. New contours are derived from that actual asset.

`book-cups-hatching-20261110.svg` supplies sparse irregular blue/sage background
strokes. Each illustration has its own absolutely positioned background layer
inside an isolated wrapper. Styles belong to their respective block stylesheet,
because assembled component styles are scoped. The hatches occupy no layout
space and render beneath the foreground artwork. Both layers use the existing
1060ms pencil renderer; the hatching deliberately has no paper-fill layer.

Browser checks at320/393/430/768/1280px found no horizontal overflow. Foreground
and hatching dimensions match: book160px high; cups110/115px on phones,160px on
tablet and190px on desktop. Motion-off shows all artwork immediately. Native
screenshots and detailed measurements are retained with the image-generation
prompt outside the deployment. No form data was sent.

Build `7c42ecf918` passed all44tests and the static check:51files,2,989,581bytes,
85local references and57canonical artwork hashes. There are12active raster
artwork records; former book choices are excluded from the drawing runtime.

The completed surface-comparison source14a529702dd0b308ecc45b54a01c5695740d511c
is integrated. Its original/blue/green/duo choices and controller are retained.
All four choices were checked with book4 and the new cups, including preservation
of entered form text; no data was submitted. An independent agent reviewed the
phone/desktop screenshots and found no adaptivity regressions.
