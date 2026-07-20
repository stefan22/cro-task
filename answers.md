# O2 Phones Listing Redesign — Additional Questions

## 1. Metrics to evaluate success

The hypothesis indicates that changing the cards design, it will make offers stand out: shrinking the cards, and making products easier to compare — so the metric hierarchy should stay close to that mechanism before jumping to revenue, otherwise a flat bottom-line result tells us nothing about whether the design change itself worked.

### Primary metric

- **Listing-to-PDP click-through rate:** Click-through rate from a tariff card to the product/tariff page, e.g. clicks on "View tariffs",
  unique visitors who viewed the /shop/phones listing (or unique card impressions. This sits immediately downstream of the changed element, so it isolates the effect of the redesign rather than everything else that happens later in the funnel.

### Secondary / diagnostic metrics

- **Compare checkbox engagement rate.** Directly tests the "easier to compare" part of the hypothesis. Track checkbox toggles and, or how 
  many users open it and with how many products selected.
- **Info (i) icon interaction rate.** Tracks whether the info icon still gets found and used once the "Learn more" text is gone — a drop 
  here would flag a discoverability regression.
- **Scroll depth / cards viewed per session.** A smaller card means more product per screen; scroll depth and time-to-first-click indicate whether people are actually scanning more products, not just clicking the first thing faster.
- **Device split of all the above.** Segmented by mobile vs. desktop, since checkbox tap targets, icon-only buttons, and reduced padding usually behave very differently on small screens.

### Guardrail metrics

- **Page performance (CLS/LCP).** Injecting/rewriting DOM after initial render risks layout shift; monitor Core Web Vitals on the variant so a UX win isn't offset by a performance regression.



## 2. Debugging unexpected or inconsistent results

Inconsistent or unexpected results are often linked to data quality and/ or actual implementation problems, so the first thing should be 
ruling them out. 

### 1. Rule out instrumentation and QA issues first

- **Flicker / FOUC check.** Confirm the variant renders correctly and consistently across browsers/devices, and check for a flicker/FOUC effect where users briefly see the control before the injected JS applies — this is one of the most common causes of contaminated data in client-side A/B tests, since users can click the original element mid-flicker.
- **Duplicate event firing.** Because the grid re-renders on tab switches and pagination, verify the "already processed" guard in `experiment.js` is actually preventing duplicate impression/click events from the same card, which would inflate or skew CTR.
- **Sample ratio mismatch (SRM).** Check the actual variant vs. control split against the configured allocation (e.g. 50/50). A skewed split is a strong, well-known signal of a bucketing or redirect bug, and invalidates the read until it's fixed.

### 2. Segment the data to isolate where it breaks

- **Cut by segment:** device type, browser, new vs. returning visitor, traffic source, and time of day/week. If the anomaly is concentrated in one segment — e.g. only Safari, or only mobile — that points at a rendering or tap-target bug rather than a real behavioural effect.
- **Check statistical power and novelty effects.** If inconsistency means day-to-day volatility, check whether the sample size was ever sufficient for the effect size being observed, and whether the test is still within its novelty-effect window (early spikes/dips that regress toward the mean as users get used to the change).

### 3. Look for external confounders

- **Confounding changes:** other concurrent experiments or marketing campaigns touching the same page, a pricing or stock change on specific tariffs, or a seasonal spike (e.g. a launch event) that lands unevenly across variants due to timing of the split.

### 4. Validate qualitatively

- **Session replay.** Watch session recordings/heatmaps of real variant sessions to catch UX issues aggregate metrics hide — e.g. the checkbox being too small to tap accurately, or the info icon overlapping the CTA on narrow viewports.

### 5. Fix and re-run cleanly

Once a root cause is identified — whether a tracking bug, a rendering defect, or a genuinely segment-specific effect — the fix is implemented, and the test is restarted rather than resumed, since data collected before the fix is contaminated and shouldn't be blended with clean data. If the effect turns out to be real and segment-specific (e.g. only mobile users respond positively), that's a legitimate finding in itself and can inform a targeted rollout rather than an all-or-nothing ship decision.
