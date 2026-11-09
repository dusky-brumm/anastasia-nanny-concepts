# Additional phone layout review

Extended the earlier 393 × 852 review to 360 × 800, 384 × 854, 412 × 915, 414 × 896, 430 × 932, 448 × 998 and 480 × 960 CSS px. Each size has an overlapping screenshot pass through the complete page. This is browser viewport emulation, not testing on physical phones or in mobile Safari.

The portrait layouts passed: no page overflow, no heading/illustration collisions, complete stage names and fitting price values. Color controls remain on one row with 44 px height; fields use 16 px text and consistent 20 px gaps. The reviewer independently inspected 27 portrait frames and found no further spacing changes necessary.

The 915 × 412 landscape check revealed that five process columns activated too early. The final heading had only 144 px available for 159 px of text, and the descriptions were narrow. The process now uses two columns from 761 through 1100 px, with 16 px descriptions and the same artwork. Numbers preserve the reading order across rows; crossing route arrows are hidden in that composition. Five columns start at 1101 px. On landscape screens up to 1100 px wide and 500 px high, process padding is 60 px instead of 112 px, leaving more useful room around the stages.

Checked boundaries at 760/761 and 1100/1101 px, plus 640 × 360, 740 × 360, 1024 × 600 and 1280 × 800. All five stages remain present, headings fit and the document has no horizontal overflow. The reviewer rechecked the two-column layout, final fifth stage and minimum width of 761 px. The seven portrait layouts retain the same heading geometry after the change.

Interaction checks:

- All three reviews at 360 and 480 px keep the same section height while switching.
- Four About stories at 360 px keep their control position and section height stable.
- The form retains name/message when switching colors at 480 px; fields remain white with 16 px text.
- The menu fits or scrolls within 320 × 568, 640 × 360 and 740 × 360; the final application link remains reachable and closes the menu.

Artifacts are outside the published source in `artifacts/phone-matrix-20261110/`: screenshot sequences, DOM measurements, `critique.md` and a gallery. Source photos, illustration pixels, selected colors and content are unchanged.
