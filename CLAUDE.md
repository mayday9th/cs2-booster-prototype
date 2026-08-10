# CS2 Trading Card Booster Prototype

Presentation prototype: booster-opening flow for CS2 trading cards. Plain HTML/CSS/JS, no build step.

## Figma source
File key: `BeXdtOHsQdFlqXVck8fHdQ`
- `8:14` — Cards front (existing, don't re-export)
- `37:7` — Card front, QR-expanded state (existing, don't re-export)
- `26:17307` — Card Back, plain (new, needs export)
- `39:396` — Card Back hover, two rarity-glow variants (new, needs export)
- `40:407` — Booster Pack, "GOLDEN KNIVES" (new, needs export)

## Fixed cards for this presentation (not random)
1. AK-47 | Ice Coaled — Classified (`#C92ADB`)
2. Desert Eagle | Mecha Industries — Classified (`#C92ADB`)
3. AWP | Printstream — Covert (`#E34747`)

## Hard constraints — do not violate
- Never mix manual `z-index` with `translateZ`/`preserve-3d` on siblings inside the same 3D transform context. Depth ordering within a 3D context comes only from DOM order and `translateZ`/`rotateY`.
- Badge (top-right) always shows rarity; the line under the title always shows quality — both as live DOM text bound to data, never baked into a background image.
- Never patch or occlude baked-in image text with sampled or blurred image patches. If text must change per state, it's a real text element from the start.
- Before editing any existing effect (holo shimmer, tilt, mask), inspect the current file first — don't guess at what's already there.

## Progress tracking
See `TASKS.md`. Update it after finishing each phase, before ending the session.
