(() => {
  'use strict';

  const RARITY_COLOR = { Classified: '#C92ADB', Covert: '#E34747' };

  // Fixed deal — always these three, in this order.
  const CARDS = [
    {
      weaponKey: 'AK-47 | Ice Coaled',
      fileKey: 'ak',
      art: './assets/card-front-ak.svg',
      gun: './assets/ak-1.png',
      rarity: 'Classified',
      fan: { x: -260, y: 20, r: -12 }
    },
    {
      weaponKey: 'Desert Eagle | Mecha Industries',
      fileKey: 'de',
      art: './assets/card-front-de.svg',
      gun: './assets/de-1.png',
      rarity: 'Classified',
      fan: { x: 0, y: 0, r: 0 }
    },
    {
      weaponKey: 'AWP | Printstream',
      fileKey: 'awp',
      art: './assets/card-front-awp.svg',
      gun: './assets/awp-1.png',
      rarity: 'Covert',
      fan: { x: 260, y: 20, r: 12 },
      holo: true
    }
  ];

  const QUALITY = 'Factory New';

  // ---- ported from the existing interactive front-card component ----
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    return [h, s * 100, l * 100];
  }

  function hslToCss(h, s, l) {
    return `hsl(${((h % 360) + 360) % 360}, ${Math.max(0, Math.min(100, s)).toFixed(0)}%, ${Math.max(0, Math.min(100, l)).toFixed(0)}%)`;
  }

  function rarityGradient(badgeColor, rarity) {
    const [h, s, l] = hexToHsl(badgeColor);
    const offsetSets = {
      Covert: [-10, -5, 0, 8, 38],
      Classified: [-12, -6, 0, 10, 40]
    };
    const offsets = offsetSets[rarity] || [-10, -5, 0, 8, 35];
    const lFactors = [0.28, 0.4, 0.35, 0.42, 0.25];
    const sFactors = [0.6, 0.7, 0.75, 0.7, 0.55];
    const stops = offsets.map((off, i) =>
      hslToCss(h + off, Math.min(100, s * sFactors[i]), Math.max(15, Math.min(88, l * lFactors[i])))
    );
    return `repeating-linear-gradient(115deg, ${stops[0]} 0%, ${stops[1]} 15%, ${stops[2]} 30%, ${stops[3]} 45%, ${stops[4]} 60%)`;
  }

  // ---- state ----
  const state = {
    phase: 'closed', // 'closed' | 'opening' | 'revealed'
    flipped: [false, false, false]
  };

  const booster = document.getElementById('booster');
  const tray = document.getElementById('tray');

  booster.addEventListener('click', openBooster);

  function openBooster() {
    if (state.phase !== 'closed') return;
    state.phase = 'opening';
    booster.classList.add('bursting');
    booster.disabled = true;

    setTimeout(() => {
      booster.hidden = true;
      dealCards();
      state.phase = 'revealed';
    }, 360);
  }

  function dealCards() {
    tray.hidden = false;
    CARDS.forEach((card, i) => {
      const slot = buildCardSlot(card, i);
      tray.appendChild(slot);
      // force layout so the initial (booster-origin) transform is committed
      // before switching to the fanned-out position, otherwise the browser
      // coalesces both states and skips the transition.
      // eslint-disable-next-line no-unused-expressions
      slot.getBoundingClientRect();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => slot.classList.add('dealt'));
      });
    });
  }

  function buildCardSlot(card, index) {
    const rarityColor = RARITY_COLOR[card.rarity];

    const slot = document.createElement('div');
    slot.className = 'card-slot';
    slot.style.setProperty('--rarity-color', rarityColor);
    slot.style.setProperty('--fan-x', card.fan.x + 'px');
    slot.style.setProperty('--fan-y', card.fan.y + 'px');
    slot.style.setProperty('--fan-r', card.fan.r + 'deg');
    slot.style.setProperty('--deal-delay', (index * 120) + 'ms');

    const flipPerspective = document.createElement('div');
    flipPerspective.className = 'flip-perspective';

    const flipInner = document.createElement('div');
    flipInner.className = 'flip-inner';

    const back = buildBackFace();
    const front = buildFrontFace(card);

    flipInner.appendChild(back);
    flipInner.appendChild(front);
    flipPerspective.appendChild(flipInner);
    slot.appendChild(flipPerspective);

    flipInner.addEventListener('click', () => flipCard(index, slot));

    return slot;
  }

  function flipCard(index, slot) {
    if (state.flipped[index]) return;
    state.flipped[index] = true;
    slot.classList.add('flipped');
  }

  function buildBackFace() {
    const back = document.createElement('div');
    back.className = 'card-face back';
    return back;
  }

  function buildFrontFace(card) {
    const front = document.createElement('div');
    front.className = 'card-face front';

    const tiltPerspective = document.createElement('div');
    tiltPerspective.className = 'tilt-perspective';

    const tiltInner = document.createElement('div');
    tiltInner.className = 'tilt-inner';

    // depth ladder — DOM order matches ascending translateZ, no z-index anywhere
    const art = document.createElement('div');
    art.className = 'tilt-layer art-layer';
    art.style.backgroundImage = `url('${card.art}')`;
    tiltInner.appendChild(art);

    let holoFoil = null, holoSparkle = null;
    if (card.holo) {
      holoFoil = document.createElement('div');
      holoFoil.className = 'tilt-layer holo-layer holo-foil';
      holoFoil.style.backgroundImage = rarityGradient(RARITY_COLOR[card.rarity], card.rarity);
      tiltInner.appendChild(holoFoil);

      holoSparkle = document.createElement('div');
      holoSparkle.className = 'tilt-layer holo-layer holo-sparkle';
      tiltInner.appendChild(holoSparkle);
    }

    const weaponSlot = document.createElement('div');
    weaponSlot.className = 'weapon-slot';
    const gunImg = document.createElement('div');
    gunImg.className = 'gun-img';
    gunImg.style.backgroundImage = `url('${card.gun}')`;
    weaponSlot.appendChild(gunImg);
    tiltInner.appendChild(weaponSlot);

    const badgeText = document.createElement('div');
    badgeText.className = 'badge-text';
    badgeText.textContent = card.rarity;
    tiltInner.appendChild(badgeText);

    const subtitleText = document.createElement('div');
    subtitleText.className = 'subtitle-text';
    subtitleText.textContent = QUALITY;
    tiltInner.appendChild(subtitleText);

    const qrChip = document.createElement('div');
    qrChip.className = 'qr-chip';
    const qrImg = document.createElement('img');
    qrImg.src = './assets/qr-code.png';
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

      if (card.holo) updateHolo(px * 100, py * 100);
    });
    tiltPerspective.addEventListener('pointerenter', () => { hover = true; });
    tiltPerspective.addEventListener('pointerleave', () => {
      hover = false;
      if (card.holo) resetHoloIdleTarget();
    });

    function applyTilt() {
      const scale = hover ? 1.045 : 1;
      tiltInner.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
      tiltInner.style.transition = hover
        ? 'transform 0.08s ease-out, box-shadow 0.3s ease-out'
        : 'transform 0.6s ease-out, box-shadow 0.3s ease-out';
      tiltInner.style.boxShadow = `${(-ry * 2.4).toFixed(1)}px ${(rx * 2.4 + 18).toFixed(1)}px 46px rgba(0,0,0,${hover ? 0.55 : 0.38})`;
    }

    // idle motion loop, matches the original component's behavior when not hovering
    let idleHoloX = 50, idleHoloY = 50;
    const t0 = performance.now();
    (function loop() {
      if (!hover) {
        const t = (performance.now() - t0) / 1000;
        rx = Math.sin(t * 0.5) * 2.5;
        ry = Math.cos(t * 0.35) * 3.5;
        applyTilt();
        if (card.holo) {
          idleHoloX = 50 + Math.sin(t * 0.4) * 6;
          idleHoloY = 50 + Math.cos(t * 0.3) * 6;
          setHoloVars(idleHoloX, idleHoloY, 0.22);
        }
      }
      requestAnimationFrame(loop);
    })();

    function resetHoloIdleTarget() {
      // next idle tick picks the gentle oscillation back up; nothing to snap here
    }

    function setHoloVars(px, py, opacity) {
      const foilX = 50 + (px - 50) / 1.5;
      const foilY = 50 + (py - 50) / 1.5;
      const sparkleX = 50 + (px - 50) / 7;
      const sparkleY = 50 + (py - 50) / 7;
      tiltInner.style.setProperty('--foil-pos-x', foilX + '%');
      tiltInner.style.setProperty('--foil-pos-y', foilY + '%');
      tiltInner.style.setProperty('--sparkle-pos-x', sparkleX + '%');
      tiltInner.style.setProperty('--sparkle-pos-y', sparkleY + '%');
      tiltInner.style.setProperty('--effect-opacity', opacity);
    }

    function updateHolo(px, py) {
      const rawOpacity = 0.2 + (Math.abs(50 - px) + Math.abs(50 - py)) * 0.015;
      const opacity = Math.max(0.2, Math.min(0.85, rawOpacity));
      setHoloVars(px, py, opacity);
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
      img.src = './assets/qr-code.png';
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
