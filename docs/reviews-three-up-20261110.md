# Restore three reviews per desktop page

The previous release forced a760px slider with one card at every width. Restore
the full content width and three equal cards above the820px component breakpoint.
Phones keep a readable single-card slider. There are six saved quotations: the
current three and three restored verbatim from the October30 prototype. Their
source and author labels are retained in review-restored-content-20261110.json.
The restored cards use initials because their archived source contains no
portraits; no testimonial text or portrait was generated.

Navigation advances by the number of visible cards measured from the layout.
Desktop gets two pages,1–3 and4–6, and two chalk dots. Phones get six dots and
single-card steps. Arrows, dots, keyboard Home/End and horizontal scrolling use
the same page boundaries. Only each page's first card is a scroll-snap target.
On resize, the active review's page is retained and visible cards remain in
the accessibility tree together. Dot targets fit320px phones without overflow.

Browser checks:1280px and1024px show3cards/2pages;390px and320px show1card/6pages.
Verified forward/back arrows, dot selection, keyboard navigation, last-to-first
wrap, phone-to-desktop resize and normal smooth scrolling.

Build5907273c78:52tests passed, exact Worker/public-asset verification passed,
static check passed with57files/3,312,780bytes and57artwork hashes. Form delivery,
selected drawings, existing surface comparisons and all other blocks are
preserved. No form was submitted during testing.
