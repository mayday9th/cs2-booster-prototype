(() => {
  'use strict';

  const RARITY_COLOR = { Classified: '#C92ADB', Covert: '#E34747' };

  // Fixed deal — always these three, in this order.
  const CARDS = [
    {
      weaponKey: 'AK-47 | Ice Coaled',
      title: 'AK-47',
      skinName: 'Ice Coaled',
      fileKey: 'ak',
      art: './assets/card-front-ak.svg',
      gun: './assets/ak-1.png',
      rarity: 'Classified',
      fan: { x: -448, y: 0, r: 0 },
      bgLayers: './assets/card-front-ak-bg-layers.svg',
      texture: './assets/card-front-ak-texture.jpg',
      qr: './assets/card-front-ak-qr.png'
    },
    {
      weaponKey: 'Desert Eagle | Mecha Industries',
      title: 'Desert Eagle',
      skinName: 'Mecha Industries',
      fileKey: 'de',
      art: './assets/card-front-de.svg',
      gun: './assets/de-1.png',
      rarity: 'Classified',
      fan: { x: 0, y: 0, r: 0 },
      bgLayers: './assets/card-front-de-bg-layers.svg',
      texture: './assets/card-front-de-texture.jpg',
      qr: './assets/card-front-de-qr.png'
    },
    {
      weaponKey: 'AWP | Printstream',
      title: 'AWP',
      skinName: 'Printstream',
      fileKey: 'awp',
      art: './assets/card-front-awp.svg',
      gun: './assets/awp-1.png',
      rarity: 'Covert',
      fan: { x: 448, y: 0, r: 0 },
      holo: true,
      bgLayers: './assets/card-front-awp-bg-layers.svg',
      texture: './assets/card-front-awp-texture.jpg',
      qr: './assets/card-front-awp-qr.png'
    }
  ];

  const QUALITY = 'Factory New';
  const SUBLABEL = 'Restricted Claim';

  // Figma's stacked-back reference (node 81:460) offsets each card by
  // (0,8) / (4,4) / (8,0) in its native 336-wide canvas — a diagonal peek,
  // not a dead-center overlap. Scaled by the same 400/336 factor used for
  // the card size, then re-centered on the group's own centroid so the
  // stack still sits exactly where the booster was, just staggered.
  const STACK_OFFSETS = [
    { x: -4.8, y: 4.8 },
    { x: 0, y: 0 },
    { x: 4.8, y: -4.8 }
  ];


  // ---- state ----
  const state = {
    phase: 'closed', // 'closed' | 'opening' | 'revealed'
    flipped: [false, false, false]
  };

  const booster = document.getElementById('booster');
  const tray = document.getElementById('tray');

  // cards are built and stacked immediately — they're physically in place
  // under the booster (DOM order + no z-index puts the booster on top,
  // and the booster's own footprint fully covers the stack) from the
  // start, not animated in after the booster disappears.
  buildStack();

  booster.addEventListener('click', openBooster);

  const BURN_MS = 1900;   // stage A — burn away (matches the SVG burn animations' dur)
  const STACK_PAUSE_MS = 760; // pause between stack reveal and deal-out

  // the organic dissolve is authored as SMIL <animate> elements with
  // begin="indefinite" (see index.html) so it can be started exactly on
  // click rather than on page load; all three share the same duration and
  // easing so the erosion mask and its glowing ring stay in lockstep.
  const BURN_ANIM_IDS = ['burnAnimMain', 'burnAnimRingA', 'burnAnimRingB'];

  function openBooster() {
    if (state.phase !== 'closed') return;
    state.phase = 'opening';
    booster.classList.add('burning');
    booster.disabled = true;

    BURN_ANIM_IDS.forEach((id) => {
      const anim = document.getElementById(id);
      if (anim && typeof anim.beginElement === 'function') anim.beginElement();
    });

    setTimeout(() => {
      booster.hidden = true;
      setTimeout(fanOut, STACK_PAUSE_MS);
    }, BURN_MS);
  }

  // stage B — cards already sit stacked face-down, offset diagonally per
  // the Figma reference, ready to be revealed once the booster is gone.
  function buildStack() {
    CARDS.forEach((card, i) => {
      const slot = buildCardSlot(card, i);
      slot.classList.add('stacked');
      tray.appendChild(slot);
    });
  }

  // stage C — deal out to row positions, staggered
  function fanOut() {
    tray.querySelectorAll('.card-slot').forEach((slot) => slot.classList.add('dealt'));
    state.phase = 'revealed';
  }

  function buildCardSlot(card, index) {
    const rarityColor = RARITY_COLOR[card.rarity];

    const slot = document.createElement('div');
    slot.className = 'card-slot';
    slot.style.setProperty('--rarity-color', rarityColor);
    slot.style.setProperty('--stack-x', STACK_OFFSETS[index].x + 'px');
    slot.style.setProperty('--stack-y', STACK_OFFSETS[index].y + 'px');
    slot.style.setProperty('--fan-x', card.fan.x + 'px');
    slot.style.setProperty('--fan-y', card.fan.y + 'px');
    slot.style.setProperty('--fan-r', card.fan.r + 'deg');
    slot.style.setProperty('--deal-delay', (index * 120) + 'ms');

    const flipPerspective = document.createElement('div');
    flipPerspective.className = 'flip-perspective';

    const flipInner = document.createElement('div');
    flipInner.className = 'flip-inner';

    const { el: back, triggerExplosion } = buildBackFace(rarityColor, card.holo);
    const front = buildFrontFace(card);

    flipInner.appendChild(back);
    flipInner.appendChild(front);
    flipPerspective.appendChild(flipInner);
    slot.appendChild(flipPerspective);

    flipInner.addEventListener('click', () => {
      // fires immediately on click, not synced to the flip's own rotation —
      // the burst is the reaction to the click itself, per the reference
      if (card.holo) triggerExplosion();
      flipCard(index, slot);
    });

    return slot;
  }

  function flipCard(index, slot) {
    if (state.flipped[index]) return;
    state.flipped[index] = true;
    slot.classList.add('flipped');
  }

  function buildBackFace(rarityColor, isRare) {
    const back = document.createElement('div');
    back.className = 'card-face back';

    const backTiltPerspective = document.createElement('div');
    backTiltPerspective.className = 'back-tilt-perspective';

    const backTiltInner = document.createElement('div');
    backTiltInner.className = 'back-tilt-inner';

    // rare-only: iridescent aura behind the card, brightened on hover via
    // pure CSS (:hover), sits in the non-tilting perspective layer so it
    // reads as an ambient glow rather than tracking the tilt itself
    let shimmerLayer = null;
    if (isRare) {
      shimmerLayer = document.createElement('div');
      shimmerLayer.className = 'back-shimmer-layer';
      backTiltPerspective.appendChild(shimmerLayer);
    }

    const backTexture = document.createElement('div');
    backTexture.className = 'back-texture-layer';
    backTiltInner.appendChild(backTexture);

    // rare-only: one-shot bright burst, triggered from app.js on click
    let explosionLayer = null;
    if (isRare) {
      explosionLayer = document.createElement('div');
      explosionLayer.className = 'back-explosion-layer';
      backTiltInner.appendChild(explosionLayer);
    }

    backTiltPerspective.appendChild(backTiltInner);
    back.appendChild(backTiltPerspective);

    // ---- mouse-tracking tilt + glow, ported from the front-card mechanism ----
    const tiltStrength = 10;
    let hover = false;
    let rx = 0, ry = 0;

    backTiltPerspective.addEventListener('pointermove', (e) => {
      const rect = backTiltPerspective.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      ry = (px - 0.5) * tiltStrength;
      rx = (0.5 - py) * tiltStrength;
      hover = true;
      applyBackTilt();
    });
    backTiltPerspective.addEventListener('pointerenter', () => {
      hover = true;
      applyBackTilt();
    });
    backTiltPerspective.addEventListener('pointerleave', () => {
      hover = false;
      rx = 0;
      ry = 0;
      applyBackTilt();
    });

    const INSET_BEVEL = 'inset 2px 2px 4px 0px rgba(255, 255, 255, 0.1), inset 4px 4px 8px 0px rgba(0, 0, 0, 0.6)';

    function applyBackTilt() {
      const scale = hover ? 1.045 : 1;
      const lift = hover ? -8 : 0;
      backTiltInner.style.transform =
        `translateY(${lift}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
      backTiltInner.style.boxShadow = hover
        ? `0 0 0 2px ${rarityColor}, 0 0 40px 8px color-mix(in srgb, ${rarityColor} 70%, transparent), 0 22px 32px rgba(0, 0, 0, 0.45), ${INSET_BEVEL}`
        : `0 0 0 2px transparent, 0 0 0 0 transparent, 0 0 0 rgba(0, 0, 0, 0), ${INSET_BEVEL}`;
    }

    function triggerExplosion() {
      if (!explosionLayer) return;
      explosionLayer.classList.remove('exploding');
      // eslint-disable-next-line no-unused-expressions
      explosionLayer.getBoundingClientRect(); // force reflow so re-adding the class restarts the animation
      explosionLayer.classList.add('exploding');
    }

    return { el: back, triggerExplosion };
  }

  function buildFrontFace(card) {
    const front = document.createElement('div');
    front.className = 'card-face front';

    const tiltPerspective = document.createElement('div');
    tiltPerspective.className = 'tilt-perspective';

    const tiltInner = document.createElement('div');
    tiltInner.className = 'tilt-inner';

    // depth ladder — DOM order matches ascending translateZ, no z-index anywhere
    const artBase = document.createElement('div');
    artBase.className = 'tilt-layer art-base-layer';
    tiltInner.appendChild(artBase);

    if (card.bgLayers) {
      const bgLayers = document.createElement('div');
      bgLayers.className = 'tilt-layer bg-layers-layer';
      bgLayers.style.backgroundImage = `url('${card.bgLayers}')`;
      tiltInner.appendChild(bgLayers);
    }

    if (card.texture) {
      const texture = document.createElement('div');
      texture.className = 'tilt-layer front-texture-layer';
      texture.style.backgroundImage = `url('${card.texture}')`;
      tiltInner.appendChild(texture);
    }

    const art = document.createElement('div');
    art.className = 'tilt-layer art-layer';
    art.style.backgroundImage = `url('${card.art}')`;
    tiltInner.appendChild(art);

    const weaponSlot = document.createElement('div');
    weaponSlot.className = 'weapon-slot';
    const gunImg = document.createElement('div');
    gunImg.className = 'gun-img';
    gunImg.style.backgroundImage = `url('${card.gun}')`;
    weaponSlot.appendChild(gunImg);
    tiltInner.appendChild(weaponSlot);

    const titleText = document.createElement('div');
    titleText.className = 'title-text';
    titleText.textContent = card.title;
    tiltInner.appendChild(titleText);

    const skinNameText = document.createElement('div');
    skinNameText.className = 'skin-name-text';
    skinNameText.textContent = card.skinName;
    tiltInner.appendChild(skinNameText);

    const badgeText = document.createElement('div');
    badgeText.className = 'badge-text';
    badgeText.textContent = card.rarity;
    tiltInner.appendChild(badgeText);

    const subtitleText = document.createElement('div');
    subtitleText.className = 'subtitle-text';
    subtitleText.textContent = QUALITY;
    tiltInner.appendChild(subtitleText);

    const sublabelText = document.createElement('div');
    sublabelText.className = 'sublabel-text';
    sublabelText.textContent = SUBLABEL;
    tiltInner.appendChild(sublabelText);

    const qrChip = document.createElement('div');
    qrChip.className = 'qr-chip';
    const qrImg = document.createElement('img');
    qrImg.src = card.qr || './assets/qr-code.png';
    qrImg.alt = 'QR';
    qrChip.appendChild(qrImg);
    tiltInner.appendChild(qrChip);

    tiltPerspective.appendChild(tiltInner);
    front.appendChild(tiltPerspective);

    // ---- tilt-on-hover ----
    const tiltStrength = 22;
    let hover = false;
    let rx = 0, ry = 0;

    tiltPerspective.addEventListener('pointermove', (e) => {
      const rect = tiltPerspective.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      ry = (px - 0.5) * tiltStrength;
      rx = (0.5 - py) * tiltStrength;
      hover = true;
      applyTilt();
    });
    tiltPerspective.addEventListener('pointerenter', () => { hover = true; });
    tiltPerspective.addEventListener('pointerleave', () => {
      hover = false;
      rx = 0;
      ry = 0;
      applyTilt();
    });

    function applyTilt() {
      const scale = hover ? 1.045 : 1;
      tiltInner.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
      tiltInner.style.transition = hover
        ? 'transform 0.08s ease-out, box-shadow 0.3s ease-out'
        : 'transform 0.6s ease-out, box-shadow 0.3s ease-out';
      tiltInner.style.boxShadow = `${(-ry * 2.4).toFixed(1)}px ${(rx * 2.4 + 18).toFixed(1)}px 46px rgba(0,0,0,${hover ? 0.55 : 0.38})`;
    }

    // ---- QR expand/collapse ----
    let expanded = false;
    let overlay = null;
    let pageCatcher = null;

    qrChip.addEventListener('click', (e) => {
      e.stopPropagation();
      if (expanded) return;
      expanded = true;
      overlay = buildQrOverlay();
      tiltInner.appendChild(overlay);
      pageCatcher = document.createElement('div');
      pageCatcher.className = 'page-catcher';
      pageCatcher.style.cssText = 'position:fixed;inset:0;z-index:500;cursor:pointer;';
      pageCatcher.addEventListener('click', closeQr);
      document.body.appendChild(pageCatcher);
    });

    function closeQr() {
      if (!expanded) return;
      expanded = false;
      if (overlay) overlay.remove();
      if (pageCatcher) pageCatcher.remove();
      overlay = null;
      pageCatcher = null;
    }

    function buildQrOverlay() {
      const ov = document.createElement('div');
      ov.className = 'tilt-layer qr-overlay';
      ov.addEventListener('click', closeQr);

      const img = document.createElement('img');
      img.src = card.qr || './assets/qr-code.png';
      img.alt = 'QR code';
      img.addEventListener('click', (e) => e.stopPropagation());
      ov.appendChild(img);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'qr-close';
      closeBtn.type = 'button';
      closeBtn.innerHTML = '&#10005;';
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeQr(); });
      ov.appendChild(closeBtn);

      return ov;
    }

    return front;
  }
})();
