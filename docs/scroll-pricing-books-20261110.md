# Scroll-driven pricing patches and guestbook choices

Base: completed source `cab756f89669824306cbf2fc99327d30f8f97cc5` from the
parallel “Акценты и анимации” chat. Its green form, compact header/mobile cover,
desktop arrow drawing, service spacing and shorter pricing block are retained.

The three selected price backgrounds grow from small circular patches into the
approved chalk masks. Current viewport position controls scale, clip radius and
a restrained drift (up to 2px horizontally, 1.4px vertically and 1.1 degrees).
Reversing scroll reverses the effect. There is no time input, CSS transition,
keyframe animation or continuous animation-frame loop. Only the backgrounds
move; text, amounts and illustrations retain their positions. Without JavaScript,
with motion disabled, or with system reduced motion, the approved full shapes
remain visible. The existing drawing scheduler batches updates once per frame.

The user asked for book alternatives while retaining the current pencil reveal:

1. Current matched guestbook from 9 November.
2. Earlier open guestbook from 9 November.
3. Earlier library illustration of a book on a blanket.
4. New light notebook with a blue ribbon.
5. New half-open album with a bookmark.

Only this illustration gets choices. The review cards/carousel are unchanged.
The existing contour, hatched background and detail renderer animates a selected
book, with the same duration as before. Clicking a choice again replays that
book. `?book=1` through `?book=5` share a selection. The default remains the
current illustration until the user chooses. No unrelated design controls return.

New bitmap assets were created with the built-in ImageGen tool, referencing
the current guestbook and the interview illustration. Original PNGs and exact
prompts are retained in `artifacts/scroll-pricing-books-20261110/`. WebP delivery
encoding retains the generated dimensions and alpha. Each drawing has contours
derived from its actual source asset, verified by SHA256.

Browser checks covered all five drawings at 320, 360, 393, 430, 768 and 1280px:
one visible panel/pressed choice, unchanged 160px frame, 44px controls, and no
horizontal overflow. Selection triggers drawing and reaches complete. With
`motion=off`, all books are complete and pricing patches are static. The history
and comparison screenshots are retained with the prompts outside the deployment.
On the 393px phone viewport, the three patch transforms stayed exactly identical
between stationary samples; scrolling back and returning to the same document
position restored identical scale, clipping and transforms for all three. Their
computed CSS has no animation or transition, and the browser reported no errors.

Build `345bfb4506`: all 44 tests and static checks pass. Deployed assets: 55 files,
3,062,781 bytes, 89 local references, 54 canonical artwork hashes. No temporary
comparison proof page is included in the published site.
