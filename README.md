# O2 Phones Listing Redesign — Implementation Notes

`experiment.js` contains all JavaScript and CSS for the `/shop/phones` tariff card redesign, injected via a DOM-injection extension (not console-run). CSS is merged into a single `injectCss()` function that runs first, on every pass.

## Acceptance criteria

| # | Requirement | Status | Implementation |
|---|---|---|---|
| 1 | Remove the number of colours available | Done | `removeColours()` — finds the colours badge by its stable class fragment (`badge-colors-container`) and removes it. |
| 2 | Move any 5G / 5G Ready / 5G SA label next to the ratings | Done | `ratingsAndFiveG()` — wraps the rating element and the 5G badge in a shared `.vmo2cro-rating-row`, and normalises the badge text to "5G READY". |
| 3 | If a product has no ratings, add the empty rating icons as in design | Done | `ratingsAndFiveG()` — when Bazaarvoice reports a 0 rating (and only once the widget has actually finished loading, to avoid a race with async loading), swaps it for 5 empty star glyphs. |
| 4 | Remove the star icon and line divider, reduce padding before/after | Done | `removeStarDivider()` — removes the `<hr>` divider row and tightens padding on the elements above/below it. |
| 5 | Replace "Learn more" with just the (i) icon | Done | `replaceLearnMoreWithIcon()` — removes the text label, keeps the icon button, and aligns it with the offer text via a flex row. |
| 6 | Replace the compare button with a checkbox | Done | `replaceCompareButtonWithCheckbox()` — hides the real button (kept functional, off-screen) and renders a custom checkbox + box that mirrors its state. Clicking anywhere in the row toggles the real button and re-syncs once the site's own state settles. |
| 7 | Reduce padding between countdown timer (if available) and View tariffs CTA | **Not implemented** | No live card with an active countdown was available to build/verify a selector against. See note below. |
| 8 | Remove any promo banner inserted within the listing (O2 Satellite, delivery, click & collect, extras, Disney, etc.) | Done | `removePromoBanners()` — removes any grid item marked `[data-testid="tile-fragment"]` (confirmed against the live "O2 Satellite" tile) and the `_15gifts-launchpad` widget. Also excluded from `getTariffCards()` so no other function touches it. |

### Note on #7

The brief's phrasing ("if available") and the fact that it's a separate bullet from the compare-checkbox item indicate this should be a self-healing, conditional style fix — the same pattern as the rest of the file — rather than something tied to compare state. No card with a live countdown showed up during testing, so this wasn't implemented; if one is found, it just needs its selector added to `injectCss()`/a small new function following the existing pattern.

## Notes / behavioural requirements

| Requirement | Status | Implementation |
|---|---|---|
| Runs on `/shop/phones`, re-applies when switching tabs | Done | `observeGrid()` watches the page with a debounced `MutationObserver` and re-runs all functions on any DOM change while on the target page. |
| Applies to cards shown via "View all phones" / "Show next" | Done | Same `MutationObserver` re-run picks up newly rendered cards; each function is idempotent so re-running doesn't duplicate work. |
| No changes applied on a different URL | Done | `isTargetPage()` checks `location.pathname` against exactly `/shop/phones` before the initial run and before every observer-triggered re-run — covers `/shop/phones/refurbished`, individual phone product pages, and anywhere else. |
| Applies to all cards on the page, not just the example screenshots | Done | `getTariffCards()` returns every card in the grid; all functions iterate over the full array. |

## Other files

- `answers.md` — written responses to the two open questions (success metrics, and debugging inconsistent results).
