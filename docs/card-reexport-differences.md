# Card front re-export — structural differences, all 3 cards

Step 2 of the re-export plan. Diagnosis/documentation only, no asset changes.
Builds on [`seam-diagnosis-8-15.md`](seam-diagnosis-8-15.md) (Step 1, AK-47
only) — this covers all three committed front SVGs against their current
Figma nodes:

| Card | Committed file | Figma node |
|---|---|---|
| AK-47 | `assets/card-front-ak.svg` | `8:15` |
| Desert Eagle | `assets/card-front-de.svg` | `25:16671` |
| AWP | `assets/card-front-awp.svg` | `25:15674` |

All three live under the same parent frame, `8:14` ("Cards front"), confirmed
via `get_metadata` — their absolute positions on the page are `x=296`,
`x=672`, `x=1048` respectively (a uniform `376px` = `336px` card + `40px`
gutter spacing). All three committed SVGs' internal ids carry their node's
own suffix (`_8_15`, `_25_16671`, `_25_15674`), so each comparison below is
apples-to-apples.

## What's structurally identical across all three (both in Figma and committed)

- Canvas `336×480`, `rounded-16`, single outer clip.
- Root background: `<rect fill="{rarity-color}">` **plus** a `4px` inset
  stroke in the same color (`<rect x=2 y=2 w=332 h=476 rx=14 stroke=... stroke-width=4>`)
  — present in all three committed files. (Step 1 said this stroke was
  missing from AK's file; that was a grep miss, corrected there.)
- `Frame 6` (border/frame bleed art): `4` child "Subtract" vectors, visual
  bounds `(-4,-16)` / geometric bounds `(0,-12)`, `336×504` — same in all
  three, same 4px effect-vs-geometry offset noted in Step 1.
- `Textures` (crack sheet): `992×480`, relative offset `x=-328` from the
  card's own frame — **identical registration in all three cards**. This is
  good news for a re-export: the shared-sheet crop offset isn't a per-card
  variable, it's constant, so getting it right once should generalize.
- Header gradient (black→transparent, `336×72`) with the weapon category
  name; Product Details gradient (transparent→black, `336×200`) with skin
  name / quality label / "Restricted Claim" / QR code — same layout slots,
  same coordinates, in all three.
- QR Code slot: `48×48` at `(264,128)` inside Product Details, in all three.
- No `<text>` elements anywhere in any of the three committed SVGs — every
  label (category, skin name, quality, "Restricted Claim", rarity badge) is
  baked as vector path outlines, not real text. Current Figma, by contrast,
  returns these as real `<p>` text nodes via `get_design_context`. That's
  consistent across all three cards, not a per-card difference, but it's the
  reason Phase 1 had to patch text mismatches with opaque CSS chips instead
  of editing text directly — worth keeping in mind for Step 3+: a re-export
  through the design-to-code pipeline would naturally produce real text
  instead, which is a bigger change than "swap the art" if adopted.
- Every committed file's embedded raster `<image>` has an **empty `href`**
  (confirmed for all three, not just AK — see per-card table below). None of
  the three committed SVGs are faithful single-shot exports.

## Per-card findings

### AK-47 (`8:15`)

Already covered in depth in Step 1. Two things Step 1 didn't have (found now
by comparing against DE/AWP):

- **AK's SVG bakes an extra, redundant raster patch that DE/AWP's don't.**
  AK has *two* embedded images: `image0_8_15` (`500×500`, filled into a
  `<rect x=264 y=408 w=48 h=48 rx=2>` — i.e. a baked QR-code-shaped patch at
  exactly the QR slot's position) and `image1_8_15` (`512×384`, the actual
  product photo). DE and AWP each have **only one** embedded image (their
  `512×384` product photo) — no baked QR patch at all. Since the app's own
  live `.qr-chip` DOM element (opaque, white background) sits on top of this
  spot and fully covers whatever's under it, this is currently invisible —
  but it means AK's source art isn't structurally parallel to DE/AWP's, and
  a re-export that treats all three uniformly needs to account for that
  (either drop the redundant QR patch from AK to match DE/AWP, or note that
  DE/AWP never had one to begin with).
- **AK's product-photo rect has a deliberate 1px inset that DE/AWP don't.**
  Photo rect at `x=25`, but its own clip window (`clipPath1`) starts at
  `x=24` — a 1px inset. This matches Step 1's finding #5 (live Figma:
  `Product Image` local `x=1` for AK) and confirms it's real, baked, and
  AK-specific: DE's and AWP's photo rects sit at `x=24`, flush with their
  clip windows (matching their own live Figma `Product Image` local `x=0`).
  Step 1's writeup implied this offset as a general "preserve sub-pixel
  offsets" rule; scoping it precisely: it's an AK-only offset, not present
  on the other two cards, in either Figma or committed geometry.

### Desert Eagle (`25:16671`)

- Category text "Desert Eagle" (vs AK's "AK-47") — proportionally wider
  title-shadow filter box (`w=137.2` vs AK's `w=72.6`), as expected.
- Skin name "Mecha Industries" — widest of the three skin names, widest
  shadow filter box (`w=238.5` vs AK's `147.1`, AWP's `170.7`).
- `Union` (glow underlay) is a **single vector shape** (like AK), local
  bounds `(44.4, 28.1, 197.9×154.2)` — different size/position than AK's
  `(4, 38, 280.4×139.7)` (expected — different gun silhouette), but same
  *kind* of shape (one path, not compound).
- `image 28 [Vectorized]` frame width is `287.719`, not AK's clean `288` —
  confirmed in both Figma metadata and the committed SVG's `clipPath1` rect
  (`width="287.719"`). This is consistent between Figma and committed (not
  drift), but it does mean DE's product-art crop window is `~0.28px`
  narrower than AK's — a re-export treating "288px product frame" as a
  universal constant across all three cards would be very slightly wrong for
  DE (and AWP, same width).
- Badge Container: committed SVG bakes the pill at `x=243, w=77` — **same
  numbers as AK**, despite DE's rarity text also being "Classified" (same as
  AK, so same width is actually correct/expected here). Current live Figma
  auto-sizes this pill to `x=255, w=65` for both AK and DE — i.e. both
  cards' baked pill is `12px` wider than what Figma renders today. Uniform
  drift, not a DE-specific issue.

### AWP (`25:15674`)

- Category text baked in Figma as `" AWP"` — **a literal leading space** in
  the live text layer's content (visible in `get_design_context`'s JSX as
  `{\` AWP\`}`, using an expression wrapper specifically because plain JSX
  text would collapse the leading whitespace). AK ("AK-47") and DE ("Desert
  Eagle") have no such artifact. Cannot confirm whether the currently
  committed AWP SVG's baked title glyphs also carry this leading space,
  since none of the committed files contain real `<text>` nodes to inspect —
  it's baked as outlined vector paths, so the "space" would just be an
  extra gap between the frame edge and the first glyph, not a
  separately-inspectable character. Worth a visual check in Step 3.
- `Union` (glow underlay) is **not a simple vector — it's a
  `boolean-operation` composed of roughly 130 individual child vectors**
  (the fine marbled/stained "Printstream" pattern detail), overall bounds
  `(10.85, 48.8, 268.6×102.8)`. This is categorically different from AK's
  and DE's single-path `Union` shapes. `get_design_context` still resolves
  it to one flattened SVG asset for embedding purposes, so from an
  export-output standpoint it's still "one image" — but the source
  complexity means AWP's glow layer is far more likely to render
  differently (missed detail, flattening differences, boolean-op precision)
  if any export step re-flattens or re-rasterizes it, versus AK/DE's much
  simpler single-path glow.
- `Product Image` sizing uses a **different Tailwind construct** than AK/DE:
  AK and DE both carry an explicit `aspect-[512/384]` class (Figma enforcing
  the raster's native aspect ratio as a constraint); AWP's equivalent div
  instead has fixed `h-[216px] w-[288px]` with no aspect-ratio class — sized
  directly to the frame, not aspect-locked. All three end up filling
  basically the same box today (the source photos apparently are already
  close to that aspect), but it's a real difference in how the *node* is
  configured, and a re-export that copies each node's own sizing mode
  faithfully would treat AWP's photo differently (stretch-to-fit) than
  AK/DE's (aspect-constrained, letterboxed/cropped if the photo's real
  aspect ever doesn't match 512:384 exactly).
- Badge Container: committed SVG bakes the pill at `x=243, w=77` — **same
  fixed numbers as AK/DE**, even though AWP's rarity text is "Covert" (6
  chars, much shorter than "Classified"'s 10). Live Figma auto-sizes AWP's
  badge to `x=271, w=49` — `28px` narrower than the baked pill, the largest
  drift of the three (AK/DE drift by `12px`, AWP by `28px`). Strong
  indicator the badge pill shape was templated once (sized for
  "Classified") and copy-pasted across all three cards without re-sizing
  for AWP's shorter word — not Figma drift, an original-export oversight.
  (In practice this baked pill is fully covered by the app's own live
  `.badge-text` CSS chip today, so it's not visibly wrong — but a re-export
  should size each card's pill to its own text, per Figma, rather than
  reproducing this shared mistake.)
- `image 27 [Vectorized]` frame width `287.719`, same as DE (not AK's `288`)
  — consistent with DE, see DE section above.

## Summary table

| | AK-47 | Desert Eagle | AWP |
|---|---|---|---|
| Rarity / color | Classified / `#C92ADB` | Classified / `#C92ADB` | Covert / `#E34747` |
| `Union` glow shape | single vector | single vector | **boolean-op, ~130 sub-vectors** |
| Product Image sizing | `aspect-[512/384]` | `aspect-[512/384]` | **fixed `288×216`, no aspect lock** |
| Product Image inset vs. clip window | **1px inset** (`x=25` vs clip `x=24`) | flush (`x=24`) | flush (`x=24`) |
| Baked QR patch in committed SVG | **yes** (`image0`, `500×500`) | no | no |
| `image N [Vectorized]` frame width | `288` (exact) | `287.719` | `287.719` |
| Baked badge pill width vs. live Figma | `77` vs `65` (Δ12) | `77` vs `65` (Δ12) | `77` vs `49` (Δ28) |
| Committed `<image>` `href` | empty | empty | empty |
| Category text quirk | — | — | leading space `" AWP"` |

## What this means for Steps 3-4

- The shared-texture crop offset (`x=-328` on a `992×480` sheet) is
  confirmed constant across all three cards — a re-export approach validated
  on AK (Step 3) should carry over to DE/AWP directly for that piece.
- AWP is the highest-risk card for re-export fidelity: compound boolean-op
  glow geometry, a different Product Image sizing mode, and the largest
  badge-pill drift. Treat its trial export with extra scrutiny even after
  AK's approach is confirmed working.
- The badge-pill width mismatch (baked vs. live) exists on all three cards
  and predates this investigation — it's currently harmless only because the
  live CSS `.badge-text` chip fully occludes it. A re-export is a natural
  point to fix it (size each pill to its own text per current Figma) but
  doing so isn't required for the seam fix specifically; call this out
  separately if Step 3/4 touch the badge pill at all.
- AK's redundant baked QR patch is dead weight (fully occluded by the live
  `.qr-chip`) — safe to drop during re-export for consistency with DE/AWP,
  not required to fix the seam.
