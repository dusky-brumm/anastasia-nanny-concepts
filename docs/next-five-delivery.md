# Five new website designs, 30 October 2026

The new entry point is `dist/next.html`. The root opens this gallery; the previous six remain at `atelier.html`, with earlier galleries and saved concept URLs retained.

Five independent compositions were implemented in `src/next/` with individual styles in `dist/next/`. They share verified business facts, typography and browser-local UI behavior. They do not import earlier presentation styles or layout modules. The sidebar, interview-led page, overlapping portrait and photo-strip opening are complete compositions with different service, process, pricing and review treatments.

Every page retains the approved headline and the nine requested sections in order. The page shell stops at 1120px. Pastel blue, milk-white and muted sage are paired with dark green. The new series uses locally hosted Golos Text and Lora, with their OFL licenses. The supplied cafe photograph was encoded as a 140KB WebP with the original dimensions; the original PNG and earlier pages remain intact.

## Visual refinement

All five were captured completely at desktop and phone sizes, independently reviewed and corrected, then captured again. Corrections include clearer process outcomes, shorter pricing introductions, a genuinely paired comparison on mobile, removal of repeated profile copy, a distinct service section for the album and removal of duplicated format headings/prices. The portrait composition was additionally corrected on tablet so its panel no longer covers the photo caption or crowds the face.

The final browser matrix contains 30 observations: five pages at 320/390/768/1440/1920/2560px. There is no page or checked text overflow. At2560px the shell is 1120px with approximately 712px margins. Full tablet and narrow-phone screenshots were also inspected. The approved headline, faces, controls and all nine sections remain visible. The gallery was inspected on desktop and phone; a missing word space after a responsive line break was corrected.

The gallery uses actual browser captures, not generated mockups. Complete desktop/mobile WebP screenshots and lightweight cover previews are published in `dist/next/screens/` and `previews/`. Original PNGs, geometry, critique reports and interaction evidence remain in the ignored `project-notes/next-2026-10-30/` directory. `scripts/prepare-next-previews.py` checks screenshot height against the observed DOM geometry before export.

## Interaction verification

Menus, Escape, navigation closure, consultation selection, required-field validation, draft creation/invalidation and privacy dialogs were checked on all five pages. The interview cases support click, arrows, Home and End. The album formats support click and keyboard navigation and update the selected service in the form. All five native process disclosures open and close; their outcomes remain visible when closed.

Menu closure at the desktop breakpoint was corrected, and the shared UI dependency is versioned by content hash for the new pages. A discovered favorite-ID compatibility issue was fixed without dropping earlier selections. Favorite persistence after reload, filtering, empty results, reset and both preview modes were verified. The new-series/earlier-series persistence case has a regression test.

Script-free fixtures for the interview and album pages confirmed both panels remain readable, submission remains disabled and Enter does not put contact fields in the URL. The temporary distribution fixtures were removed after verification; copies remain only in ignored local evidence.

## Prototype scope and publication

Prices and timelines carry a visible confirmation note. Replacement and unlimited candidates apply to full selection only. Forms prepare a local message for the visitor to send in Telegram; they do not submit or store contact data. Connecting production submissions and approved data-processing documents remains a launch task.

Build, static validation, the regression suite and a whitespace check are required before publication. Sources are published to GitHub `main`; the exact `dist/` subtree is published to `codex/github-pages`. The existing private Site uses the same source commit and an archive of its committed static output, preserving its audience.
