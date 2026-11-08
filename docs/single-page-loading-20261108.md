# Stable loading of the selected final site

The published home is now one HTML document. All nine approved sections are rendered in their original order, including their text, photos, illustrations and accessible field names. There are no public block iframes or height-estimation scripts. The independently editable block sources remain under `src/site/blocks`.

`scripts/assemble-selected-page.mjs` consolidates the block styles with PostCSS and its selector parser. Each original document gets an isolated wrapper with a zero-specificity scope. Former html/body/main selectors retain their roles and specificity inside that wrapper. Width queries and viewport-width units use the component width, preserving the original responsive geometry without counting the page scrollbar. SVG definition IDs are unique across sections. Relative asset links and local anchors are rebased for GitHub project hosting.

Local WOFF2 data is included once in the combined stylesheet, with the original licenses retained in the output. Fonts decode before the first content paint; a 1.2-second fail-open guard prevents an indefinite hidden page if a resource fails. There is no image or network-font wait in that guard. The handwritten signature has a reserved width so its social icons cannot change rows during font selection.

One deferred runtime binds the menu, stories, reviews, request and drawings. Navigation uses native anchors. Mobile review cards share a stable row height. Drawings already visible when JavaScript arrives remain complete; only unseen illustrations are prepared for later drawing. Completed strokes are skipped during scroll updates. Pending photos may fade in after decoding, without changing their reserved dimensions; photos remain visible if JavaScript is unavailable.

Build with `npm ci`, `npm run build`, `npm run check` and `npm test`. PostCSS dependencies are build-only. The runtime has no package dependency or module-request chain.

Loading comparison and screenshots are stored outside the source checkout in `artifacts/stable-loading-20261108`. The local comparison server delays raster images by one second and separate font files by 600 ms. This is a diagnostic stress test, not a field Core Web Vitals measurement. The original parent-frame CLS alone omits shifts inside its child documents, so it must not be directly compared to the new single-document CLS.
