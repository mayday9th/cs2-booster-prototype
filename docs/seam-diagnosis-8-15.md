# Card front re-export — seam root cause (node 8:15, AK-47)

Diagnosis only, no files changed except this doc and `TASKS.md`. Compared the
committed `assets/card-front-ak.svg` against the live Figma node `8:15`
(`get_design_context` + `get_metadata`, file `BeXdtOHsQdFlqXVck8fHdQ`).

Confirmed the committed SVG really was originally exported from `8:15` — its
internal ids (`clip0_8_15`, `filter0_d_8_15`, `image0_8_15`, ...) all carry
that node's id suffix, so this is an apples-to-apples comparison, not a
different-node mismatch.

## What's in the committed SVG

- Flat `336×480` canvas (`viewBox="0 0 336 480"`), single `<g clip-path="url(#clip0_8_15)">` wrapping everything.
- Background is a plain `<rect rx="16" fill="#C92ADB">` — the rarity color baked as a literal fill, no stroke.
- The crack ("kintsugi") pattern is baked as hundreds of individual `<path fill="#505050" style="mix-blend-mode:multiply">` shapes, pre-flattened to sit exactly within the 336×480 canvas — no offsets, no signs of a larger source canvas.
- Two raster images are wired via `<use xlink:href="#image0_8_15">` / `#image1_8_15` with `scale()` transforms, but the `<image>` elements they reference have **no `href` at all** — empty stubs, zero embedded data.
- Three drop-shadow filters (`filter0/1/2_d_8_15`) sit at bounding boxes that line up with the title, rarity badge, and skin-name text.
- One blur filter (`filter3_f_8_15`, box `x20 y110 w296 h155`) with no text/shadow role — see below.

## What's live in Figma (node 8:15)

Via `get_metadata` (raw geometry, relative to the `8:15` frame):

| Layer | x | y | w | h |
|---|---|---|---|---|
| `Frame 6` (border/frame art) | 0 | -12 | 336 | 504 |
| `Textures` (crack sheet) | **-328** | 0 | **992** | 480 |
| `Header` / "AK-47" text | 24 | 24 | 58 | 24 |
| `Product Details` frame | 0 | 280 | 336 | 200 |
| `image 26 [Vectorized]` frame | 24 | 96 | 288 | 216 |
| — `Union` (glow underlay) | +4 | +38 | 280.4 | 139.7 |
| — `Product Image` (gun photo) | +1 | 0 | 288 | 216 |
| `Badge Container` | 255 | 16 | 65 | 24 |

Root frame (`Card_Front AK` / `8:15`) also carries `bg-[#c92adb]` **and**
`border-4 border-[#c92adb]` per `get_design_context` — a redundant same-color
stroke the committed SVG doesn't have.

## Root causes of the seam

**1. The crack texture is a shared, tiled sheet, not a per-card asset.**
`Textures` is `992×480`, positioned at `x=-328` relative to this card's
`336×480` frame — i.e. it's centered on this card and bleeds exactly `328px`
into where the neighboring cards sit, `336 + 328 + 328 = 992`. It's one big
crack canvas shared across all three cards, and each card is just a cropped
window into it. The committed SVG has this already cropped and flattened to
this card's exact window. A re-export has to reproduce that *exact* crop
offset relative to the shared sheet — if the live sheet's registration has
drifted at all since the original bake (which is exactly what CLAUDE.md's
existing note about "crack-pattern geometry has drifted" already flags), or
if the export tool crops from a different reference point than the original
bake used, the new crack pattern lands a few px off from the old one. Every
other layer that was hand-positioned in CSS to line up with the *old* crack
geometry — the `.badge-text`/`.subtitle-text` opaque chips, the gun-image
slot, the `card-mask.png` holo mask — would then visibly misalign against it.
That misalignment is the seam.

**2. Two disagreeing bounding-box systems, off by a consistent 4px.**
`get_design_context`'s generated code places `Frame 6` at `(-4, -16)`;
`get_metadata`'s raw geometry places the *same node* at `(0, -12)` — a
uniform 4px offset in both axes, the signature of an effect (shadow/stroke)
expanding the "visual" bounding box beyond the "geometric" one. If a
re-export mixes the two conventions — e.g. crops the texture using geometric
bounds but positions the border art using effect-inclusive bounds, or the
reverse — that's a few-px misalignment landing right at the card edge, again
exactly where a seam reads as most visible.

**3. The committed SVG's embedded images are already broken.** The two
`<image>` stubs referenced via `<use>` have empty `href`s — no data at all.
That means the currently-committed file isn't even a faithful single-shot
export; per `.claude/settings.local.json`'s permission history, it was
hand-assembled from several separately-fetched pieces (`qlmanage`,
`cairosvg`, individual `curl`s of per-asset Figma URLs, manual `cp`
composition), not one atomic `get_design_context`/export call. A proper
re-export today will embed images through a completely different mechanism
(either full data URIs, or downloaded-and-committed CDN assets — Figma's
`get_design_context` asset URLs are documented to expire after ~7 days, so
they can't be left as live references). The two files can't be spliced
together; a correct re-export replaces the whole asset-embedding approach,
not just the geometry.

**4. A blur effect the design-to-code conversion silently drops.** The
committed SVG's blur filter (`filter3_f_8_15`, box `x20 y110 w296 h155`)
lines up almost exactly with `Union`'s absolute bounds (`x28 y134 w280 h140`,
padded outward as expected for a Gaussian blur filter region) — i.e. `Union`
(the glow/silhouette shape behind the gun photo) carries a blur effect in the
source file. `get_design_context`'s React/Tailwind reference code for that
same node has **no blur class** on the equivalent div — Tailwind's arbitrary-
value codegen doesn't reliably preserve every Figma effect. If the earlier
failed re-export leaned on that generated code as the literal output (rather
than treating it as reference-only, per the design-to-code skill's own
instructions), the `Union` glow's blur was plausibly lost or flattened,
changing how the glow reads against the crack texture underneath it.

**5. A sub-pixel offset that's intentional in the source, not drift.**
Inside `image 26 [Vectorized]`, `Product Image` (the gun photo) sits `1px`
right of the frame's own left edge, while `Union` (the glow underlay) sits
`4px` in from the same edge — they're deliberately *not* concentric. A
re-export needs to preserve that exact relative offset rather than
"cleaning it up" to a centered value, or the glow will visibly shift against
the photo it's supposed to sit behind.

## What a correct re-export needs to account for

- Crop the shared `992`-wide `Textures` sheet using the same relative
  registration the current bake used — or, if that registration can't be
  recovered exactly, treat this as a full re-alignment: re-derive and
  re-verify every dependent CSS position (badge/subtitle chip placement, gun
  slot, `card-mask.png` holo mask) against the new geometry rather than
  assuming the old alignment still holds.
- Pick one bounding-box convention (geometric vs. effect-inclusive) and use
  it consistently for every layer in the export — don't mix
  `get_design_context` bounds for some pieces and `get_metadata` bounds for
  others.
- Source embedded assets through one atomic export path (data URI, or
  downloaded-and-committed file) — not a hand-spliced mix of old and
  newly-fetched pieces.
- Manually confirm effects like `Union`'s blur survived the export by
  checking the raw node (filters/effects), not just by trusting the
  Tailwind/React reference code, which is known to drop effects it can't
  map to a utility class.
- Preserve the `Union`-vs-`Product Image` sub-pixel offset (`4px` vs `1px`
  from the shared parent edge) exactly as authored.
