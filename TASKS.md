# Tasks

## Phase 1 — Figma assets [x]
- [x] Pull `26:17307` (Card Back) from Figma — verified pixel-for-pixel against the existing `assets/card-back.svg`; already correct, not re-exported.
- [x] Pull `39:396` (Card Back hover, 2 variants) from Figma — both variants are just a rarity-colored border/glow around the same card back, confirming the existing CSS `box-shadow` + `--rarity-color` approach (already in `style.css`) is the right implementation. No new image assets needed.
- [x] Pull `40:407` (Booster Pack) from Figma, exported as `assets/booster-pack.png` (352×528, matches the Figma frame). Not yet wired into the `.booster`/`.booster-face` placeholder — that swap belongs to Phase 2 (booster click + deal animation), left untouched here.
- [x] Cross-check `8:14`/`37:7` against existing `assets/card-front-*` — found and fixed the occlusion-patch issue:
  - Badge already showed `rarity` and the subtitle line already showed `quality` — that part was correct, no fix needed.
  - No `z-index` mixed with `translateZ`/`preserve-3d` in the tilt context — none found.
  - Found `badgeOcclude`/`subtitleOcclude` (blurred image patches hiding wrong baked text) — this violates the "never patch/occlude baked-in text" constraint. Removed them from `app.js`/`style.css`, and deleted the now-dead `badge-blur-*.png`/`subtitle-blur-*.png` files.
  - Tried to re-export `card-front-{ak,de,awp}.svg` from Figma to drop the conflicting baked badge/label text at the source. Blocked: the live Figma file's crack-pattern geometry for `8:14` has drifted from what's baked into the currently-committed SVGs (confirmed by direct pixel comparison — a re-export introduces a visible seam), so the SVGs were left as-is, matching CLAUDE.md's "don't re-export" note.
  - Instead fixed it at the CSS layer: `.badge-text` and `.subtitle-text` now have solid opaque background chips sized to fully cover the conflicting baked text underneath (same pattern the badge pill already used). Verified in-browser on all 3 cards — no bleed-through.
  - Follow-up (not done here, bigger than Phase 1): a designer-provided re-export of the front card art with the badge/label regions genuinely excluded, or promoting weapon-name/skin-name to live DOM against a text-free background.
- [x] Commit: "Phase 1: export card back, hover variants, and booster assets from Figma"

## Phase 2 — Booster click + deal animation [x]
- [x] Booster placeholder → click → burst transition — was already implemented in `app.js`/`style.css` (ported alongside the front-card component before Phase 1 started).
- [x] 3 fixed cards deal out face-down, staggered pop-in — same as above, verified in-browser.
- [x] Wired the real Figma-exported `assets/booster-pack.png` ("GOLDEN KNIVES" art, baked-in "CLICK TO OPEN") into `.booster-face`, replacing the generic gray placeholder + duplicate text label that were still in place. Resized `.booster` to the export's native 352×528 (2:3) aspect. Verified burst + deal still trigger correctly after the swap.
- [x] Commit: "Phase 2: booster open + deal animation"

## Phase 3 — Flip + hover glow [x]
- [x] Hover on face-down card → glow in its rarity color — verified in-browser (purple for the two Classified cards, red for the Covert AWP).
- [x] Click → flip to existing front-card component (reuse, don't rebuild) — verified in-browser, front face renders correctly with badge/subtitle/QR.
- [x] Commit: "Phase 3: flip mechanics + hover glow"

## Revision — Card front re-export (Figma has drifted from committed SVGs) [ ]
- [x] Step 1: Diagnose root cause of the seam from the earlier failed re-export attempt (structural analysis, no code changes) — full findings in [`docs/seam-diagnosis-8-15.md`](docs/seam-diagnosis-8-15.md). Short version: the crack texture is a shared `992×480` sheet cropped per-card (this card's crop offset is `x=-328` relative to its own `336×480` frame), so a re-export has to reproduce that exact crop registration or every dependent CSS position (badge/subtitle chips, gun slot, holo mask) drifts out of alignment. Compounding factors: `get_design_context`'s bounding boxes and `get_metadata`'s raw geometry disagree by a consistent 4px (effect-inclusive vs. geometric bounds) on the border-art layer; the committed SVG's two embedded raster images are already broken stubs (empty `href`) from an earlier hand-assembled export, so old and new assets can't be spliced; and the `Union` glow shape's blur effect doesn't survive `get_design_context`'s Tailwind conversion, so it must be verified against raw node data, not the generated reference code.
- [ ] Step 2: Document full list of actual differences between old committed SVGs and current Figma design (structure, not just texture)
- [ ] Step 3: Trial re-export of AK-47 only, confirm no seam
- [ ] Step 4: Re-export Desert Eagle and AWP using the same confirmed approach
- [ ] Step 5: Regression check — tilt, live badge/subtitle text, QR expand, and the AWP holo effect all still work after asset swap
- [ ] Step 6: Commit and push

## Phase 4 — Holo effect (Covert only) [x]
- [x] Pointer-tracking foil + sparkle layers on AWP | Printstream only — present in `app.js` (`holoFoil`/`holoSparkle`, `updateHolo`), masked to the card's crack pattern via `card-mask.png`. Confirmed only the `holo: true` card (AWP) gets the layers.
- [x] Commit: "Phase 4: pointer-tracking holo effect"

## Phase 5 — Polish / open follow-ups [ ]
- [ ] Designer-provided re-export of `card-front-{ak,de,awp}.svg` with badge/label regions genuinely excluded (currently patched with opaque CSS chips per Phase 1 notes), or promote weapon/skin name fully to live DOM.
- [ ] Confirm holo shimmer is visually convincing against the dark Covert card background (subtle in a static screenshot — re-check with live pointer movement).
