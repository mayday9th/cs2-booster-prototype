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

## Phase 2 — Booster click + deal animation [ ]
- [ ] Booster placeholder → click → burst transition
- [ ] 3 fixed cards deal out face-down, staggered pop-in
- [ ] Commit: "Phase 2: booster open + deal animation"

## Phase 3 — Flip + hover glow [ ]
- [ ] Hover on face-down card → glow in its rarity color
- [ ] Click → flip to existing front-card component (reuse, don't rebuild)
- [ ] Commit: "Phase 3: flip mechanics + hover glow"

## Phase 4 — Holo effect (Covert only) [ ]
- [ ] Pointer-tracking foil + sparkle layers on AWP | Printstream only
- [ ] Commit: "Phase 4: pointer-tracking holo effect"
