# Card back re-sync — diagnosis (Step B1-B2, node 26:17307)

Investigation only, no asset changes. Compared the committed `assets/card-back.svg`
against the live Figma node `26:17307` (`get_design_context` + `get_metadata`,
file `BeXdtOHsQdFlqXVck8fHdQ`), mirroring the front-card diagnosis method from
[`seam-diagnosis-8-15.md`](seam-diagnosis-8-15.md).

## What's in the committed SVG

- `viewBox="40 40 336 480"` — the whole design is authored in a coordinate
  space offset by `(+40, +40)` rather than starting at `(0,0)`. Background
  rect sits at `x=40 y=40 w=336 h=480 rx=16`, matching the viewBox exactly.
  This is an unusual authoring artifact but functionally harmless — SVG
  `viewBox` maps it correctly regardless of consumer, and rendering is
  visually correct. Not a bug, just noted for completeness.
- Background: solid `<rect fill="#222B20">` — a dark, faintly **green-tinted**
  near-black (`R=34 G=43 B=32`, i.e. G is the highest channel — a real,
  measurable green lean, not just "very dark").
- ~40 small darker shading paths, all `fill="#131B11"` (a near-black dark
  green), grouped under `id="Subtract"`, **plain solid fill — no
  `mix-blend-mode`** (unlike the front cards' original crack paths, which
  used `mix-blend-mode:multiply`).
- One large `<path id="Union" d="...">` (~71KB, 64 subpaths), filled with a
  radial gradient (`paint0_radial_0_9`: stops `#D59344 → #FFCE93 → #C78332 →
  #9F5700`, an amber/gold/bronze ramp) — this is almost certainly the
  combined gold crack-vein pattern **and** the Celtic-knot emblem, flattened
  into one shape (consistent with Figma's own `Union` boolean-operation
  combining a small `Vector (Stroke)` — the emblem — with a bleed
  `Subtract` shape, see below).
- One `clipPath` matching the outer rounded-rect bounds (`rx=16`, same
  `(40,40)` offset).
- **No `<image>`/`<use>`/raster elements anywhere** — fully vector, no
  broken empty-`href` stubs (unlike the front cards' original defect).
- **No stroke/border element** — matches the front cards' back-face CSS,
  which handles the rarity-colored border entirely via a live `box-shadow`,
  never baked.
- Outer group is `<g id="Card_Front DE">` — see below, this is not a bug.

## What's live in Figma (node 26:17307)

Via `get_design_context` + `get_metadata`:

| Layer | Detail |
|---|---|
| Card frame (`46:7051`, named **"Card_Front DE"**) | `336×480`, `rounded-16`, `overflow-clip` |
| Frame background | `bg-[#1a1a1b]` — **neutral near-black gray** (`R=26 G=26 B=27`, essentially no color tint) |
| `Subtract` (`46:7052`) | `336×504` bleed asset, `-scale-y-100 rotate-180` (net: horizontal-flip placement), same oversized-bleed pattern as the front cards' `Frame 6` |
| `Union` (`46:7053`, boolean-operation) | Combines `Vector (Stroke)` (`x=256 y=330 w=56 h=126` — small, localized, bottom-right — this is the emblem) + a second `Subtract` (`336×504` bleed shape) |
| `Textures` (`46:7056`) | `992×480` raster, `x=-328` relative offset, **`mix-blend-mode:screen`** — the exact same shared-sheet texture layer found on all three front cards |
| Root frame effect | `shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.6)]` — a subtle inset bevel (soft light top-left highlight + dark shadow) |

The card frame's own node name really is **"Card_Front DE"** in the live
Figma file — this explains the committed SVG's identically-named `<g>`
wrapper. It's not an export mistake on our side; the designer evidently
duplicated/repurposed a front-card frame to build the back template and
never renamed it. Not a defect, no action needed.

## Real differences vs. non-issues

**1. Background color has genuinely shifted — confirmed real, not a
rendering/color-profile artifact.** Committed: `#222B20` (dark green, `G`
channel measurably highest). Live Figma: `#1a1a1b` (neutral near-black, all
channels within 1 of each other). This is a directly-read hex value from
`get_design_context`'s generated markup, not an eyeballed screenshot
comparison — the difference is real and in the source data itself. Matches
the user's hypothesis exactly: this asset was likely exported in Phase 1
before the source's background token was later adjusted toward neutral
black, and the committed file was never re-synced.

**2. A whole layer is missing: `Textures` (992×480, `mix-blend-mode:screen`,
`x=-328` offset).** This is the identical shared-sheet texture mechanism
diagnosed for the front cards in [`seam-diagnosis-8-15.md`](seam-diagnosis-8-15.md)
— present live, **completely absent** from the committed card back. The
committed file's ~40 solid `#131B11` "Subtract" paths are a flat,
plain-fill approximation of shading that live Figma instead builds by
screen-blending a raster texture over the base color. This is a bigger
structural gap than just a color tweak — an actual missing rendering layer,
not present in any form in the committed SVG.

**3. Missing inset bevel/shadow effect.** Live Figma applies a two-part
inset shadow (soft white highlight top-left + dark shadow) to the card
frame for a subtle embossed/beveled look. Nothing equivalent exists in the
committed SVG (no filter, no CSS box-shadow analog in `style.css` for the
back face's base state either — the back face's only shadow today is the
live hover-glow added in the recent uncommitted revision work, which is a
different, unrelated effect).

**4. Emblem position/size — no discrepancy found.** The gold Celtic-knot
emblem (Figma's `Vector (Stroke)`, `x=256 y=330 w=56 h=126` relative to the
`336×480` card, i.e. bottom-right, ~76-93% across / ~69-95% down) reads as
consistent in position and proportion between the live Figma screenshot and
the committed asset as rendered in the app — no measurable drift here, both
place it in the same bottom-right corner at a visually matching size.

**5. Coordinate-space offset (`40,40`) — non-issue.** Cosmetic authoring
artifact of the committed file (see above), functionally harmless.

**6. No stroke/border — non-issue.** Consistent between committed and live;
neither bakes a border into the back art, both rely on (or in Figma's case,
have no equivalent of) a live-applied border effect.

## Summary for Step B3 (not started — awaiting approval)

If a re-export is approved, it would need to address, in order of impact:
1. Swap the background color `#222B20` → `#1a1a1f`-family (`#1a1a1b`).
2. Add the missing `Textures` screen-blend layer, same shared-sheet
   mechanism and `x=-328` registration already validated on the front cards
   — this is the single biggest visual gap, not just the color.
3. Optionally add the inset bevel shadow (minor polish, lowest priority of
   the three).

Per the task, **no code/asset changes made in this step** — diagnosis only.
