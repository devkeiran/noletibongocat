/* Pixel-faithful HTML5 Canvas port of KuroCat's native 2.5D CatRenderer (Sources/CatRenderer.swift) */
(function (global) {
  'use strict';

  const { clamp, rgbaToCss, sameColor, jawSide } = global.KuroSpec;

  const SEAT_ANCHOR = { x: 184, y: 226 };
  const LEFT_PAW_REST = { x: 164, y: 235 };
  const RIGHT_PAW_REST = { x: 204, y: 235 };
  const HIND_FOOT_REST = { x: 214, y: 234 };
  const MOUSE_BASE = { x: 78, y: 258 };
  const CAT_BLACK = 'rgb(22, 22, 24)';

  const STANDARD_BUILD = {
    headLift: 0,
    cheekHalfW: 42.5, crownCtrlW: 26.0, crownBaseY: -30.0, cheekY: 5.0, cheekCtrlTopY: -14.0, neckPinchX: 2.5, neckCtrlY: 24.0,
    hipHalfW: 49.0, waistCtrlW: 51.5, waistCtrlY: -48.0, botOuterW: 47.0, botInnerW: 36.0, botHalfW: 24.0,
    earFold: 0.06, earLen: 32.0, earInX: 9.0, earInY: -16.0, earOutX: 35.0, earOutY: -5.0, earTipX: 24.5, earTipY: -20.0, earTipSpread: 3.8,
    tailWidth: 11.0,
    hindLeftX: -35.0, hindW: 17.0, hindRightX: 18.0, hindLeftY: 3.0, hindLeftH: 11.0, hindStaggerY: 4.5, hindStaggerH: 12.5,
    idleTopDY: 30, idleTopX: 18.0, idleBotX: 16.0, shoulderX: 20.0, limbStartW: 19.0, limbEndW: 13.5,
    sleekEyes: false
  };

  const SLEEK_BUILD = {
    headLift: -3.0,
    cheekHalfW: 42.5, crownCtrlW: 25.0, crownBaseY: -29.5, cheekY: 6.5, cheekCtrlTopY: -13.0, neckPinchX: 6.5, neckCtrlY: 27.5,
    hipHalfW: 44.5, waistCtrlW: 41.0, waistCtrlY: -50.0, botOuterW: 42.0, botInnerW: 32.0, botHalfW: 22.0,
    earFold: 0.14, earLen: 29.5, earInX: 10.0, earInY: -16.5, earOutX: 35.5, earOutY: -4.5, earTipX: 25.0, earTipY: -18.5, earTipSpread: 4.2,
    tailWidth: 9.5,
    hindLeftX: -31.0, hindW: 15.5, hindRightX: 15.5, hindLeftY: 3.5, hindLeftH: 12.0, hindStaggerY: 4.5, hindStaggerH: 12.5,
    idleTopDY: 31, idleTopX: 16.5, idleBotX: 15.0, shoulderX: 18.5, limbStartW: 17.0, limbEndW: 12.5,
    sleekEyes: true
  };

  const EYE_THEMES = {
    neonChartreuse: { primary: [201, 242, 64], glow: [196, 242, 61] },
    siameseBlue: { primary: [176, 218, 242], glow: [173, 217, 242] },
    warmAmber: { primary: [250, 194, 56], glow: [250, 189, 51] },
    referenceHazel: { primary: [218, 178, 87], glow: [218, 178, 87] },
    softAmber: { primary: [217, 173, 85], glow: [217, 173, 85] },
    iceCyan: { primary: [115, 235, 245], glow: [107, 230, 250] }
  };

  const KB_THEMES = {
    classicMilk: {
      mouseBody: '#F4F2EC', mouseBorder: '#242429', wheel: '#F5B029',
      base: '#1A1A1F', deck: '#242429', key: '#F7F6F0', keyBorder: 'rgba(199,196,189,0.75)', accent: '#F7B329', darkText: true
    },
    midnightHacker: {
      mouseBody: '#33363D', mouseBorder: '#14141A', wheel: '#C7F240',
      base: '#0F0F14', deck: '#1A1C21', key: '#363840', keyBorder: 'rgba(28,28,33,0.95)', accent: '#C4F040', darkText: false
    },
    retroCream: {
      mouseBody: '#E3DED1', mouseBorder: '#33302E', wheel: '#E06B3D',
      base: '#403D38', deck: '#615C54', key: '#E6E0D1', keyBorder: 'rgba(173,166,153,0.85)', accent: '#E06B3D', darkText: true
    }
  };

  // Simplified 65% mechanical keyboard rows (15 units wide, 5 rows)
  const KEYBOARD_ROWS = [
    [
      { l: 'ESC', w: 1, accent: true }, { l: '1', w: 1 }, { l: '2', w: 1 }, { l: '3', w: 1 }, { l: '4', w: 1 },
      { l: '5', w: 1 }, { l: '6', w: 1 }, { l: '7', w: 1 }, { l: '8', w: 1 }, { l: '9', w: 1 },
      { l: '0', w: 1 }, { l: '-', w: 1 }, { l: '=', w: 1 }, { l: '⌫', w: 2 }
    ],
    [
      { l: '⇥', w: 1.5 }, { l: 'Q', w: 1 }, { l: 'W', w: 1 }, { l: 'E', w: 1 }, { l: 'R', w: 1 },
      { l: 'T', w: 1 }, { l: 'Y', w: 1 }, { l: 'U', w: 1 }, { l: 'I', w: 1 }, { l: 'O', w: 1 },
      { l: 'P', w: 1 }, { l: '[', w: 1 }, { l: ']', w: 1 }, { l: '\\', w: 1.5 }
    ],
    [
      { l: '⇪', w: 1.75 }, { l: 'A', w: 1 }, { l: 'S', w: 1 }, { l: 'D', w: 1 }, { l: 'F', w: 1 },
      { l: 'G', w: 1 }, { l: 'H', w: 1 }, { l: 'J', w: 1 }, { l: 'K', w: 1 }, { l: 'L', w: 1 },
      { l: ';', w: 1 }, { l: '\'', w: 1 }, { l: '↵', w: 2.25, accent: true }
    ],
    [
      { l: '⇧', w: 2.25 }, { l: 'Z', w: 1 }, { l: 'X', w: 1 }, { l: 'C', w: 1 }, { l: 'V', w: 1 },
      { l: 'B', w: 1 }, { l: 'N', w: 1 }, { l: 'M', w: 1 }, { l: ',', w: 1 }, { l: '.', w: 1 },
      { l: '/', w: 1 }, { l: '⇧', w: 1.75 }, { l: '↑', w: 1 }
    ],
    [
      { l: '⌃', w: 1.25 }, { l: '⌥', w: 1.25 }, { l: '⌘', w: 1.25 }, { l: 'space', w: 6.25, isSpace: true },
      { l: '⌘', w: 1 }, { l: '⌥', w: 1 }, { l: '←', w: 1 }, { l: '↓', w: 1 }, { l: '→', w: 1 }
    ]
  ];

  const KEYCAPS = [];
  KEYBOARD_ROWS.forEach((row, rIdx) => {
    const totalW = row.reduce((acc, k) => acc + k.w, 0);
    let x = 0;
    row.forEach((k, cIdx) => {
      KEYCAPS.push({
        id: `${rIdx}_${cIdx}`,
        row: rIdx,
        xUnits: x / totalW,
        widthUnits: k.w / totalW,
        legend: k.l,
        isSpace: !!k.isSpace,
        isAccent: !!k.accent
      });
      x += k.w;
    });
  });

  function screenQuadPoint(su, sv) {
    const tl = { x: 109, y: 238 }, tr = { x: 281, y: 247 };
    const bl = { x: 103, y: 282 }, br = { x: 286, y: 292 };
    const topX = tl.x + (tr.x - tl.x) * su;
    const topY = tl.y + (tr.y - tl.y) * su;
    const botX = bl.x + (br.x - bl.x) * su;
    const botY = bl.y + (br.y - bl.y) * su;
    return { x: topX + (botX - topX) * sv, y: topY + (botY - topY) * sv };
  }

  function around(v, c, k) {
    return k === 1 ? v : c + (v - c) * k;
  }

  function getBuild(skin) {
    return skin.shape.build === 'sleek' ? SLEEK_BUILD : STANDARD_BUILD;
  }

  function projectHead3D(x, y, z, yawRad, pitchRad) {
    const cy = Math.cos(yawRad), sy = Math.sin(yawRad);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const cp = Math.cos(pitchRad), sp = Math.sin(pitchRad);
    const y2 = y * cp + z1 * sp;
    const z2 = -y * sp + z1 * cp;
    return { x: x1, y: y2, z: z2 };
  }

  function headPoint(p, skull, skin, head, state) {
    const depth = skin.headSurface === 'dome'
      ? 29.6 * Math.sqrt(Math.max(0, 1 - (p.x / 46) ** 2 - (p.y / 40) ** 2))
      : 27.5;
    let proj = skull
      ? { x: p.x, y: p.y }
      : projectHead3D(p.x, p.y, depth, state.headYaw * 0.50, state.headPitch * 0.36);
    const hs = skin.shape.headScale;
    const px = proj.x * hs, py = proj.y * hs;
    const c = Math.cos(state.headTilt), s = Math.sin(state.headTilt);
    return { x: head.x + px * c - py * s, y: head.y + px * s + py * c };
  }

  function bodyPoint(p, skin, seatX, seatY, state) {
    const bw = skin.shape.bodyWidth;
    const sy = state.bodySquash, sx = 1 + (1 - sy) * 0.55;
    const c = Math.cos(state.bodyTilt), s = Math.sin(state.bodyTilt);
    return {
      x: seatX + p.x * bw * sx * c - p.y * sy * s,
      y: seatY + p.x * bw * sx * s + p.y * sy * c
    };
  }

  function tailCurve(seatX, seatY, state, skin) {
    const p = state.tailPhase;
    const hunt = clamp(state.huntIntensity, 0, 1);
    const wag1 = Math.sin(p) * (8.0 + hunt * 5.5);
    const wag2 = Math.cos(p * 1.3) * (6.0 + hunt * 4.5);
    const huntDrop = hunt * 14.0;
    const bw = skin.shape.bodyWidth, tl = skin.shape.tailLength;
    const shift = bw === 1 ? 0 : 34 * bw - 34;

    const root = { x: seatX + 34 + shift, y: seatY - 6 };
    const c1 = {
      x: around(seatX + 64 + shift, root.x, tl),
      y: around(seatY + 2 + wag1 * 0.35 + huntDrop * 0.4, root.y, tl)
    };
    const c2 = {
      x: around(seatX + 66 + wag2 * 0.4 + shift, root.x, tl),
      y: around(seatY - 26 + wag1 * 0.7 + huntDrop, root.y, tl)
    };
    const tip = {
      x: around(seatX + 91 + wag2 * 0.5 + shift, root.x, tl),
      y: around(seatY - 30 + wag1 * 0.85 + huntDrop, root.y, tl)
    };
    return {
      root, c1, c2, tip, thickness: skin.shape.tailThickness,
      at(pt) {
        const t = clamp(pt.x / 100, 0, 1);
        const u = 1 - t;
        const qx = u * u * u * root.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * tip.x;
        const qy = u * u * u * root.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * tip.y;
        const dx = 3 * u * u * (c1.x - root.x) + 6 * u * t * (c2.x - c1.x) + 3 * t * t * (tip.x - c2.x);
        const dy = 3 * u * u * (c1.y - root.y) + 6 * u * t * (c2.y - c1.y) + 3 * t * t * (tip.y - c2.y);
        const len = Math.max(0.001, Math.hypot(dx, dy));
        const n = pt.y * skin.shape.tailThickness;
        return { x: qx - (dy / len) * n, y: qy + (dx / len) * n };
      }
    };
  }

  function roundedQuadPath(ctx, tl, tr, br, bl, radius) {
    ctx.beginPath();
    ctx.moveTo((tl.x + tr.x) * 0.5, (tl.y + tr.y) * 0.5);
    ctx.arcTo(tr.x, tr.y, br.x, br.y, radius);
    ctx.arcTo(br.x, br.y, bl.x, bl.y, radius);
    ctx.arcTo(bl.x, bl.y, tl.x, tl.y, radius);
    ctx.arcTo(tl.x, tl.y, tr.x, tr.y, radius);
    ctx.closePath();
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawPolyline(ctx, pts, closed, map) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = map(pts[i]);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    if (closed) ctx.closePath();
  }

  function drawRegion(ctx, region, map) {
    ctx.fillStyle = rgbaToCss(region.fill);
    drawPolyline(ctx, region.flat, true, map);
    ctx.fill();
  }

  function drawMark(ctx, mark, cap, map) {
    ctx.save();
    drawPolyline(ctx, mark.points, !mark.stroke, map);
    if (!mark.stroke) {
      ctx.fillStyle = rgbaToCss(mark.color);
      ctx.fill();
    } else {
      ctx.strokeStyle = rgbaToCss(mark.color);
      ctx.lineWidth = mark.width;
      ctx.lineCap = cap || 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMouse(ctx, state, kbThemeName) {
    const th = KB_THEMES[kbThemeName] || KB_THEMES.classicMilk;
    const cx = MOUSE_BASE.x + state.mouseOffsetX;
    const cy = MOUSE_BASE.y + state.mouseOffsetY + state.mousePress * 1.6;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.22);

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 6.0, 13.5, 15.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = th.mouseBody;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13.5, 16.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(36,36,41,0.32)';
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(0, 1.5);
    ctx.stroke();

    ctx.fillStyle = th.wheel;
    roundedRectPath(ctx, -1.9, 2.5, 3.8, 8.5, 1.9);
    ctx.fill();

    ctx.strokeStyle = th.mouseBorder;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13.5, 16.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawKeyboard(ctx, state, kbThemeName, eyeThemeName) {
    const th = KB_THEMES[kbThemeName] || KB_THEMES.classicMilk;
    const eye = EYE_THEMES[eyeThemeName] || EYE_THEMES.neonChartreuse;
    const tl = screenQuadPoint(-0.012, -0.04);
    const tr = screenQuadPoint(1.012, -0.04);
    const bl = screenQuadPoint(-0.016, 1.04);
    const br = screenQuadPoint(1.016, 1.04);
    const depth = 4.5;

    ctx.save();
    roundedQuadPath(ctx,
      { x: tl.x, y: tl.y + depth + 2 }, { x: tr.x, y: tr.y + depth + 2 },
      { x: br.x, y: br.y + depth + 3 }, { x: bl.x, y: bl.y + depth + 3 }, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.fill();

    roundedQuadPath(ctx,
      { x: tl.x, y: tl.y + depth }, { x: tr.x, y: tr.y + depth },
      { x: br.x, y: br.y + depth }, { x: bl.x, y: bl.y + depth }, 5.5);
    ctx.fillStyle = th.base;
    ctx.fill();

    roundedQuadPath(ctx, tl, tr, br, bl, 5.0);
    ctx.fillStyle = th.deck;
    ctx.fill();

    const padU = 0.0028, padV = 0.014;
    for (const cap of KEYCAPS) {
      const glow = state.keyGlow[cap.id] || 0;
      const su0 = (1.0 - (cap.xUnits + cap.widthUnits)) + padU;
      const su1 = (1.0 - cap.xUnits) - padU;
      const sv0 = (1.0 - (cap.row + 1) / 5.0) + padV;
      const sv1 = (1.0 - cap.row / 5.0) - padV;
      const dy = glow * 1.9;
      const kTL = screenQuadPoint(su0, sv0); kTL.y += dy;
      const kTR = screenQuadPoint(su1, sv0); kTR.y += dy;
      const kBR = screenQuadPoint(su1, sv1); kBR.y += dy;
      const kBL = screenQuadPoint(su0, sv1); kBL.y += dy;

      roundedQuadPath(ctx, kTL, kTR, kBR, kBL, 1.5);
      ctx.fillStyle = cap.isAccent ? th.accent : th.key;
      ctx.fill();
      if (glow > 0.03) {
        ctx.fillStyle = `rgba(${eye.glow[0]},${eye.glow[1]},${eye.glow[2]},${(glow * 0.55).toFixed(3)})`;
        ctx.fill();
      }
      ctx.strokeStyle = th.keyBorder;
      ctx.lineWidth = 0.65;
      ctx.stroke();

      let cx = (kTL.x + kTR.x + kBR.x + kBL.x) * 0.25;
      let cy = (kTL.y + kTR.y + kBR.y + kBL.y) * 0.25;
      if (cap.isSpace) {
        const sp = screenQuadPoint(su0 + (su1 - su0) * 0.82, (sv0 + sv1) * 0.5);
        cx = sp.x; cy = sp.y + dy;
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI + 0.052);
      ctx.font = `600 ${cap.legend.length <= 1 ? 5.1 : 4.1}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = (cap.isAccent || th.darkText) ? 'rgba(36,36,41,0.78)' : 'rgba(224,230,235,0.82)';
      ctx.fillText(cap.legend, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawTail(ctx, seatX, seatY, state, skin) {
    const curve = tailCurve(seatX, seatY, state, skin);
    const width = getBuild(skin).tailWidth * skin.shape.tailThickness;

    ctx.save();
    ctx.strokeStyle = rgbaToCss(skin.palette.tail);
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(curve.root.x, curve.root.y);
    ctx.bezierCurveTo(curve.c1.x, curve.c1.y, curve.c2.x, curve.c2.y, curve.tip.x, curve.tip.y);
    ctx.stroke();

    if (skin.hasPartArt('tail') || skin.palette.tailTip) {
      // Build stroked clip capsule along tail curve
      ctx.save();
      const leftPts = [], rightPts = [];
      const half = width * 0.5 + 0.3;
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * 100;
        leftPts.push(curve.at({ x, y: half / skin.shape.tailThickness }));
        rightPts.push(curve.at({ x, y: -half / skin.shape.tailThickness }));
      }
      ctx.beginPath();
      ctx.moveTo(leftPts[0].x, leftPts[0].y);
      for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
      // Rounded tip cap
      const tipAngle = Math.atan2(curve.tip.y - curve.c2.y, curve.tip.x - curve.c2.x);
      ctx.arc(curve.tip.x, curve.tip.y, half, tipAngle + Math.PI * 0.5, tipAngle - Math.PI * 0.5, true);
      for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
      ctx.closePath();
      ctx.clip();

      const map = (pt) => curve.at(pt);
      for (const r of skin.regions) {
        if (r.space === 'tail') drawRegion(ctx, r, map);
      }
      if (skin.palette.tailTip) {
        const t = 0.78, u = 1 - t;
        const lerp = (a, b) => ({ x: u * a.x + t * b.x, y: u * a.y + t * b.y });
        const a = lerp(curve.root, curve.c1), b = lerp(curve.c1, curve.c2), q = lerp(curve.c2, curve.tip);
        const d = lerp(a, b), e = lerp(b, q), s = lerp(d, e);
        ctx.strokeStyle = rgbaToCss(skin.palette.tailTip);
        ctx.lineWidth = width + 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.bezierCurveTo(e.x, e.y, q.x, q.y, curve.tip.x, curve.tip.y);
        ctx.stroke();
      }
      for (const m of skin.marks) {
        if (m.space === 'tail') drawMark(ctx, m, 'butt', map);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawEar3D(ctx, isLeft, yawRad, pitchRad, fold, twitch, skin) {
    const bd = getBuild(skin);
    const sign = isLeft ? -1 : 1;
    const foldAngle = sign * (bd.earFold + fold * 0.34) + twitch;
    const earLen = bd.earLen;
    const tipDx = Math.sin(foldAngle) * earLen;
    const tipDy = -Math.cos(foldAngle) * earLen;

    let innerBase = projectHead3D(sign * bd.earInX, bd.earInY, 0, yawRad, pitchRad);
    let outerBase = projectHead3D(sign * bd.earOutX, bd.earOutY, -2, yawRad, pitchRad);
    let tip = projectHead3D(sign * bd.earTipX + tipDx, bd.earTipY + tipDy, -3, yawRad, pitchRad);

    const es = skin.shape.earSize;
    if (es !== 1) {
      const mx = (innerBase.x + outerBase.x) * 0.5;
      const my = (innerBase.y + outerBase.y) * 0.5;
      innerBase = { x: around(innerBase.x, mx, es), y: around(innerBase.y, my, es) };
      outerBase = { x: around(outerBase.x, mx, es), y: around(outerBase.y, my, es) };
      tip = { x: around(tip.x, mx, es), y: around(tip.y, my, es) };
    }

    const ebw = skin.shape.earBaseWidth || 1;
    if (ebw !== 1) {
      const mx = (innerBase.x + outerBase.x) * 0.5;
      const my = (innerBase.y + outerBase.y) * 0.5;
      innerBase = { x: around(innerBase.x, mx, ebw), y: around(innerBase.y, my, ebw) };
      outerBase = { x: around(outerBase.x, mx, ebw), y: around(outerBase.y, my, ebw) };
    }

    const ep = skin.shape.earPointiness;
    const tipSpread = bd.earTipSpread / ep;
    const tipLeft = { x: tip.x - sign * tipSpread, y: tip.y + 2.8 };
    const tipRight = { x: tip.x + sign * tipSpread, y: tip.y + 3.2 };

    const traceEar = () => {
      ctx.beginPath();
      ctx.moveTo(innerBase.x, innerBase.y);
      ctx.quadraticCurveTo(
        (innerBase.x + tipLeft.x) * 0.5 - sign * 1.5,
        (innerBase.y + tipLeft.y) * 0.5 - 2.0,
        tipLeft.x, tipLeft.y
      );
      ctx.quadraticCurveTo(tip.x, tip.y - 2.2 * ep, tipRight.x, tipRight.y);
      ctx.quadraticCurveTo(
        (outerBase.x + tipRight.x) * 0.5 + sign * 2.5,
        (outerBase.y + tipRight.y) * 0.5 - 2.0,
        outerBase.x, outerBase.y
      );
      ctx.closePath();
    };

    ctx.save();
    traceEar();
    const isDouni = skin.renderStyle === 'douni';
    const douniInk = skin.palette.outline ? rgbaToCss(skin.palette.outline) : '#2C241B';
    if (isDouni) {
      ctx.strokeStyle = douniInk;
      ctx.lineWidth = 4.6;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.fillStyle = rgbaToCss(skin.palette.earOuter);
    ctx.fill();

    if (isDouni) {
      const bMid = { x: innerBase.x * 0.62 + outerBase.x * 0.38, y: innerBase.y * 0.62 + outerBase.y * 0.38 };
      const anchor = { x: bMid.x + (tip.x - bMid.x) * 0.34, y: bMid.y + (tip.y - bMid.y) * 0.34 };
      const dx = tip.x - bMid.x, dy = tip.y - bMid.y;
      const dLen = Math.max(1, Math.hypot(dx, dy));
      const ux = dx / dLen, uy = dy / dLen, px = -uy, py = ux;
      ctx.save();
      ctx.strokeStyle = douniInk;
      ctx.lineWidth = 1.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (const [off, len] of [[-4.4, 7.2], [0, 9.6], [4.4, 6.8]]) {
        const s0x = anchor.x + px * off, s0y = anchor.y + py * off;
        ctx.moveTo(s0x, s0y);
        ctx.lineTo(s0x + ux * len + px * off * 0.12, s0y + uy * len + py * off * 0.12);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (skin.palette.earInner) {
      const inI = { x: innerBase.x + (tip.x - innerBase.x) * 0.24 + sign * 3.0, y: innerBase.y + (tip.y - innerBase.y) * 0.16 };
      const outI = { x: outerBase.x + (tip.x - outerBase.x) * 0.20 - sign * 3.8, y: outerBase.y + (tip.y - outerBase.y) * 0.18 };
      const tipI = { x: (innerBase.x + outerBase.x) * 0.16 + tip.x * 0.68, y: (innerBase.y + outerBase.y) * 0.14 + tip.y * 0.72 + 2.5 };
      ctx.beginPath();
      ctx.moveTo(inI.x, inI.y);
      ctx.quadraticCurveTo((inI.x + tipI.x) * 0.5 - sign * 0.8, (inI.y + tipI.y) * 0.5, tipI.x, tipI.y);
      ctx.quadraticCurveTo((outI.x + tipI.x) * 0.5 + sign * 1.2, (outI.y + tipI.y) * 0.5, outI.x, outI.y);
      ctx.closePath();
      ctx.fillStyle = rgbaToCss(skin.palette.earInner);
      ctx.fill();
    }

    const space = isLeft ? 'leftEar' : 'rightEar';
    if (skin.hasPartArt(space)) {
      const m = { x: (innerBase.x + outerBase.x) * 0.5, y: (innerBase.y + outerBase.y) * 0.5 };
      const map = (p) => {
        const u = p.x / 100, v = -p.y / 100;
        return {
          x: m.x + u * (outerBase.x - innerBase.x) + v * (tip.x - m.x),
          y: m.y + u * (outerBase.y - innerBase.y) + v * (tip.y - m.y)
        };
      };
      ctx.save();
      traceEar();
      ctx.clip();
      for (const r of skin.regions) if (r.space === space) drawRegion(ctx, r, map);
      for (const mk of skin.marks) if (mk.space === space) drawMark(ctx, mk, 'round', map);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawUnifiedSilhouette(ctx, seatX, seatY, headCenter, breath, state, skin) {
    const bd = getBuild(skin);
    const pal = skin.palette;
    const yaw = state.headYaw, pitch = state.headPitch;
    const hTilt = state.headTilt, bTilt = state.bodyTilt;
    const hs = skin.shape.headScale, bw = skin.shape.bodyWidth;

    const cH = Math.cos(hTilt), sH = Math.sin(hTilt);
    const H = (lx, ly) => {
      const x = lx * hs, y = ly * hs;
      return { x: headCenter.x + x * cH - y * sH, y: headCenter.y + x * sH + y * cH };
    };

    const cB = Math.cos(bTilt), sB = Math.sin(bTilt);
    const sy = state.bodySquash, sx = 1 + (1 - sy) * 0.55;
    const B = (lx, ly) => {
      const rx = lx * bw * sx, ry = ly * sy;
      return { x: seatX + rx * cB - ry * sB, y: seatY + rx * sB + ry * cB };
    };

    const cheekShift = yaw * 3.0;
    const crownDrop = pitch * 2.0;
    const cheekHalfW = bd.cheekHalfW * skin.shape.cheekFullness;
    const leftCheekX = -cheekHalfW + cheekShift * 0.4;
    const rightCheekX = cheekHalfW + cheekShift * 0.4;

    const crown = H(cheekShift * 0.2, bd.crownBaseY + crownDrop);
    const rCheek = H(rightCheekX, bd.cheekY);
    const rHip = B(bd.hipHalfW, -14);
    const rBot = B(bd.botHalfW, 12);
    const lBot = B(-bd.botHalfW, 12);
    const lHip = B(-bd.hipHalfW, -14);
    const lCheek = H(leftCheekX, bd.cheekY);

    const traceSilhouette = () => {
      const nw = skin.shape.neckWidth || 1;
      const neckCenter = cheekShift * 0.4;
      const rNeckX = neckCenter + (rightCheekX - bd.neckPinchX - neckCenter) * nw;
      const lNeckX = neckCenter + (leftCheekX + bd.neckPinchX - neckCenter) * nw;
      const neckWaistW = bd.waistCtrlW * (1 + (nw - 1) * 0.32);

      ctx.beginPath();
      ctx.moveTo(crown.x, crown.y);
      const c1a = H(bd.crownCtrlW + cheekShift * 0.3, bd.crownBaseY + crownDrop);
      const c1b = H(rightCheekX + 1.5, bd.cheekCtrlTopY);
      ctx.bezierCurveTo(c1a.x, c1a.y, c1b.x, c1b.y, rCheek.x, rCheek.y);

      const c2a = H(rNeckX, bd.neckCtrlY);
      const c2b = B(neckWaistW, bd.waistCtrlY + breath * 0.5);
      ctx.bezierCurveTo(c2a.x, c2a.y, c2b.x, c2b.y, rHip.x, rHip.y);

      const c3a = B(bd.botOuterW, 5), c3b = B(bd.botInnerW, 12);
      ctx.bezierCurveTo(c3a.x, c3a.y, c3b.x, c3b.y, rBot.x, rBot.y);
      ctx.lineTo(lBot.x, lBot.y);

      const c4a = B(-bd.botInnerW, 12), c4b = B(-bd.botOuterW, 5);
      ctx.bezierCurveTo(c4a.x, c4a.y, c4b.x, c4b.y, lHip.x, lHip.y);

      const c5a = B(-neckWaistW, bd.waistCtrlY + breath * 0.5);
      const c5b = H(lNeckX, bd.neckCtrlY);
      ctx.bezierCurveTo(c5a.x, c5a.y, c5b.x, c5b.y, lCheek.x, lCheek.y);

      const c6a = H(leftCheekX - 1.5, bd.cheekCtrlTopY);
      const c6b = H(-bd.crownCtrlW + cheekShift * 0.3, bd.crownBaseY + crownDrop);
      ctx.bezierCurveTo(c6a.x, c6a.y, c6b.x, c6b.y, crown.x, crown.y);
      ctx.closePath();
    };

    const headMap = (p) => headPoint(p, false, skin, headCenter, state);
    const skullMap = (p) => headPoint(p, true, skin, headCenter, state);
    const bodyMap = (p) => bodyPoint(p, skin, seatX, seatY, state);

    const hasPartRegions = skin.regions.some((r) => r.space === 'head' || r.space === 'skull' || r.space === 'body');
    const hasPartMarks = skin.marks.some((m) => m.space === 'head' || m.space === 'skull' || m.space === 'body');

    ctx.save();
    if (!pal.bodyShade) {
      traceSilhouette();
      ctx.fillStyle = rgbaToCss(pal.body);
      ctx.fill();
    }

    if (pal.bodyShade || skin.colorpoint || hasPartRegions || hasPartMarks) {
      ctx.save();
      traceSilhouette();
      ctx.clip();

      if (pal.bodyShade) {
        const grad = ctx.createLinearGradient(seatX, headCenter.y - 34, seatX, seatY + 18);
        grad.addColorStop(0.15, rgbaToCss(pal.body));
        grad.addColorStop(1.0, rgbaToCss(pal.bodyShade));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 360, 320);
      }

      // Curve regions with exact jaw-line clipping
      for (const r of skin.regions) {
        if (r.space !== 'head' && r.space !== 'skull' && r.space !== 'body') continue;
        ctx.save();
        const side = jawSide(r.space !== 'body', skin.shape.cheekFullness);
        drawPolyline(ctx, side, true, headMap);
        ctx.clip();
        const map = r.space === 'body' ? bodyMap : (r.space === 'skull' ? skullMap : headMap);
        drawRegion(ctx, r, map);
        ctx.restore();
      }

      // 2.5D Colorpoint face mask
      if (pal.points) {
        const mid = pal.pointsMid || pal.points;
        const yawRad = yaw * 0.50, pitchRad = pitch * 0.36;
        ctx.save();
        ctx.translate(headCenter.x, headCenter.y);
        ctx.rotate(hTilt);
        if (hs !== 1) ctx.scale(hs, hs);

        const maskCenter = projectHead3D(0, 3.0, 27.0, yawRad, pitchRad);
        const maskScaleX = Math.max(0.76, Math.cos(yawRad * 0.7));
        const maskScaleY = Math.max(0.82, Math.cos(pitchRad * 0.7));

        ctx.save();
        ctx.translate(maskCenter.x, maskCenter.y);
        ctx.scale(maskScaleX * 1.24, maskScaleY * 0.88);
        const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 31.5);
        g1.addColorStop(0.0, rgbaToCss(pal.points, 1.0));
        g1.addColorStop(0.42, rgbaToCss(pal.points, 0.92));
        g1.addColorStop(0.74, rgbaToCss(mid, 0.62));
        g1.addColorStop(1.0, rgbaToCss(mid, 0.0));
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const muzCenter = projectHead3D(0, 7.5, 28.0, yawRad, pitchRad);
        ctx.save();
        ctx.translate(muzCenter.x, muzCenter.y);
        ctx.scale(maskScaleX * 1.04, maskScaleY * 0.76);
        const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, 19.5);
        g2.addColorStop(0.0, rgbaToCss(pal.points, 1.0));
        g2.addColorStop(0.50, rgbaToCss(pal.points, 0.85));
        g2.addColorStop(1.0, rgbaToCss(pal.points, 0.0));
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      // Marks (stripes/polygons)
      for (const mk of skin.marks) {
        if (mk.space === 'body') drawMark(ctx, mk, 'round', bodyMap);
        else if (mk.space === 'skull') drawMark(ctx, mk, 'round', skullMap);
        else if (mk.space === 'head') drawMark(ctx, mk, 'round', headMap);
      }

      ctx.restore();
    }
    ctx.restore();

    const isDouni = skin.renderStyle === 'douni';
    const douniInk = pal.outline ? rgbaToCss(pal.outline) : '#2C241B';
    if (isDouni) {
      ctx.save();
      traceSilhouette();
      ctx.strokeStyle = douniInk;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Squishy mochi oval head overlapping neck + centered milk-tea taupe muzzle circle!
      const rx = cheekHalfW * 1.05;
      const topY = bd.crownBaseY + crownDrop + 0.5;
      const midY = bd.cheekY - 1.0;
      const botY = bd.cheekY + 25.5;
      const lx = -rx + cheekShift * 0.4, rxp = rx + cheekShift * 0.4;
      const traceHead = () => {
        const p0 = H(cheekShift * 0.2, topY), p1 = H(rxp, midY), p2 = H(cheekShift * 0.2, botY), p3 = H(lx, midY);
        const c1a = H(rx * 0.58 + cheekShift * 0.3, topY - 1.5), c1b = H(rxp + 2.5, topY + 10);
        const c2a = H(rxp + 1.5, botY - 4), c2b = H(rx * 0.52 + cheekShift * 0.3, botY + 1.5);
        const c3a = H(-rx * 0.52 + cheekShift * 0.3, botY + 1.5), c3b = H(lx - 1.5, botY - 4);
        const c4a = H(lx - 2.5, topY + 10), c4b = H(-rx * 0.58 + cheekShift * 0.3, topY - 1.5);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(c1a.x, c1a.y, c1b.x, c1b.y, p1.x, p1.y);
        ctx.bezierCurveTo(c2a.x, c2a.y, c2b.x, c2b.y, p2.x, p2.y);
        ctx.bezierCurveTo(c3a.x, c3a.y, c3b.x, c3b.y, p3.x, p3.y);
        ctx.bezierCurveTo(c4a.x, c4a.y, c4b.x, c4b.y, p0.x, p0.y);
        ctx.closePath();
      };
      traceHead();
      ctx.fillStyle = rgbaToCss(pal.body);
      ctx.fill();
      if (pal.points) {
        ctx.save();
        traceHead();
        ctx.clip();
        const yawRad = yaw * 0.50, pitchRad = pitch * 0.36;
        ctx.translate(headCenter.x, headCenter.y);
        ctx.rotate(hTilt);
        if (hs !== 1) ctx.scale(hs, hs);
        const mp = projectHead3D(0, 2.5, 27.5, yawRad, pitchRad);
        ctx.translate(mp.x, mp.y);
        ctx.scale(Math.max(0.74, Math.cos(yawRad * 0.72)), Math.max(0.80, Math.cos(pitchRad * 0.72)));
        const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, 17.5);
        mg.addColorStop(0, rgbaToCss(pal.points, 1.0));
        mg.addColorStop(0.76, rgbaToCss(pal.points, 0.95));
        mg.addColorStop(1, rgbaToCss(pal.points, 0.0));
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      traceHead();
      ctx.strokeStyle = douniInk;
      ctx.lineWidth = 2.45;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    } else if (pal.outline) {
      ctx.save();
      traceSilhouette();
      ctx.strokeStyle = rgbaToCss(pal.outline);
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();
    }

    // Tucked hind paws
    ctx.save();
    ctx.translate(seatX, seatY);
    ctx.rotate(bTilt);
    ctx.scale(sx, sy);

    const stagger = skin.shape.pawStagger;
    const hindW = bd.hindW;
    const leftHindX = bw === 1 ? bd.hindLeftX : (bd.hindLeftX + hindW * 0.5) * bw - hindW * 0.5;
    const rightHindX = bw === 1 ? bd.hindRightX : (bd.hindRightX + hindW * 0.5) * bw - hindW * 0.5;
    const leftHindY = bd.hindLeftY, leftHindH = bd.hindLeftH;
    const rightHindY = bd.hindLeftY + (bd.hindStaggerY - bd.hindLeftY) * stagger;
    const rightHindH = bd.hindLeftH + (bd.hindStaggerH - bd.hindLeftH) * stagger;
    const rightTucked = state.hindFootActive < 0.35;

    ctx.fillStyle = rgbaToCss(pal.paws);
    ctx.beginPath();
    ctx.ellipse(leftHindX + hindW * 0.5, leftHindY + leftHindH * 0.5, hindW * 0.5, leftHindH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (rightTucked) {
      ctx.beginPath();
      ctx.ellipse(rightHindX + hindW * 0.5, rightHindY + rightHindH * 0.5, hindW * 0.5, rightHindH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = skin.colorpoint ? rgbaToCss(pal.body, 0.55) : rgbaToCss(pal.crease, 0.58);
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(leftHindX + hindW * 0.5, leftHindY + leftHindH * 0.5, 7.5, 0.25, Math.PI - 0.25);
    ctx.stroke();
    if (rightTucked) {
      ctx.beginPath();
      ctx.arc(rightHindX + hindW * 0.5, rightHindY + rightHindH * 0.5, 7.5, 0.25, Math.PI - 0.25);
      ctx.stroke();
    }

    if (pal.pawPads) {
      ctx.fillStyle = rgbaToCss(pal.pawPads);
      const count = rightTucked ? 2 : 1;
      for (let side = 0; side < count; side++) {
        const cx = (side === 1 ? rightHindX : leftHindX) + hindW * 0.5;
        const cy = side === 1 ? rightHindY + rightHindH * 0.5 : leftHindY + leftHindH * 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 1.6, 2.7, 1.9, 0, 0, Math.PI * 2);
        ctx.fill();
        for (const tx of [-3.4, 0, 3.4]) {
          const ty = cy - 1.7 - (tx === 0 ? 0.8 : 0);
          ctx.beginPath();
          ctx.ellipse(cx + tx, ty, 1.25, 1.1, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  function drawEye3D(ctx, isLeft, yawRad, pitchRad, state, eyeThemeName, skin) {
    const sign = isLeft ? -1 : 1;
    const customIris = skin.palette.iris;
    const eyeTheme = EYE_THEMES[eyeThemeName] || EYE_THEMES.neonChartreuse;
    const eyeColorCss = customIris
      ? rgbaToCss(customIris)
      : `rgb(${eyeTheme.primary[0]},${eyeTheme.primary[1]},${eyeTheme.primary[2]})`;
    const siameseBlue = !customIris && eyeThemeName === 'siameseBlue';

    const isDouni = skin.renderStyle === 'douni';
    const douniInk = skin.palette.outline ? rgbaToCss(skin.palette.outline) : '#2C241B';
    const proj = projectHead3D(sign * (isDouni ? 16.0 : 17.2), isDouni ? 0.5 : -2.0, 27.5, yawRad, pitchRad);
    const eyeNormalAngle = yawRad + sign * 0.34;
    const fx = clamp(Math.cos(eyeNormalAngle) / Math.cos(0.34), 0.64, 1.06);
    const fy = clamp(Math.cos(pitchRad * 0.85), 0.78, 1.03);

    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.scale(fx, fy);

    if (state.petHead > 0.45 || (isDouni && state.sleepiness > 0.55)) {
      ctx.strokeStyle = isDouni ? douniInk : eyeColorCss;
      ctx.lineWidth = isDouni ? 2.4 : 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-11.5, 1.0);
      ctx.quadraticCurveTo(sign * 1.5, isDouni ? -1.4 : 3.4, 11.5, 1.0);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (state.petBody > 0.35) {
      ctx.fillStyle = isDouni ? douniInk : eyeColorCss;
      ctx.beginPath();
      ctx.moveTo(-11.5, -0.5);
      ctx.quadraticCurveTo(0, 0.6, 11.5, -0.5);
      ctx.quadraticCurveTo(0, 4.8, -11.5, -0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    const hunt = clamp(state.huntIntensity, 0, 1);
    if (!isDouni) ctx.rotate(sign * (0.06 * (1 - hunt * 0.6)));
    const isSiameseEye = getBuild(skin).sleekEyes && siameseBlue;
    const rx = isDouni ? 14.5 + hunt * 1.0 : (isSiameseEye ? 11.4 + hunt * 1.3 : 12.0 + hunt * 1.1);
    const ry = isDouni ? 13.8 + hunt * 1.2 : (isSiameseEye ? 9.8 + hunt * 2.0 : 10.8 + hunt * 1.8);

    const closure = clamp(Math.max(state.blinkProgress, state.sleepiness * 0.92), 0, 1);
    if (closure >= 0.99) {
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    if (closure > 0) {
      ctx.beginPath();
      ctx.rect(-rx - 2, -ry + 2 * ry * closure, 2 * rx + 4, 2 * ry * (1 - closure));
      ctx.clip();
    }

    if (siameseBlue) {
      const g = ctx.createLinearGradient(0, -ry, 0, ry);
      g.addColorStop(0.0, '#8FC4E6');
      g.addColorStop(0.55, '#B5DEF5');
      g.addColorStop(1.0, '#DBF1FC');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = eyeColorCss;
    }
    ctx.fillRect(-rx - 1, -ry - 1, rx * 2 + 2, ry * 2 + 2);

    const boba = isDouni ? Math.max(0.88, hunt) : hunt;
    const px = state.eyeGazeX * (4.2 - boba * (isDouni ? 1.4 : 1.2));
    const py = state.eyeGazeY * (3.6 - boba * (isDouni ? 1.2 : 1.0));
    const normalW = 5.0 * state.pupilScale;
    const normalH = 13.5 * Math.min(1.12, state.pupilScale);
    const huntD = isDouni ? 21.6 : 18.8;
    const pupilW = normalW + (huntD - normalW) * boba;
    const pupilH = normalH + (huntD - normalH) * boba;

    if (!customIris && eyeThemeName === 'referenceHazel') {
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        const mix = t * t * (3 - 2 * t);
        const rim = (1 - t) * 2.2;
        ctx.fillStyle = `rgb(${Math.round(218 - 77 * mix)},${Math.round(178 - 33 * mix)},${Math.round(87 + 41 * mix)})`;
        ctx.beginPath();
        ctx.ellipse(px, py, pupilW * 0.5 + rim, pupilH * 0.5 + rim, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = isDouni ? '#050505' : CAT_BLACK;
    ctx.beginPath();
    ctx.ellipse(px, py, pupilW * 0.5, pupilH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isDouni) {
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.beginPath();
      ctx.arc(px - pupilW * 0.12, py - pupilH * 0.24, 3.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + pupilW * 0.14, py + pupilH * 0.18, 1.55, 0, Math.PI * 2);
      ctx.fill();
    } else if (hunt > 0.25) {
      const alpha = Math.min(1, (hunt - 0.25) / 0.55) * 0.92;
      const gr = 2.1 + hunt * 0.9;
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px - pupilW * 0.22 + gr * 0.5, py - pupilH * 0.22 + gr * 0.5, gr, 0, Math.PI * 2);
      ctx.fill();
    } else if (siameseBlue) {
      ctx.fillStyle = 'rgba(255,255,255,0.86)';
      ctx.beginPath();
      ctx.arc(px - 2.9, py - 3.6, 1.65, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    if (isDouni) {
      ctx.strokeStyle = douniInk;
      ctx.lineWidth = 2.15;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHeadFeatures(ctx, center, state, eyeThemeName, skin) {
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(state.headTilt);
    if (skin.shape.headScale !== 1) ctx.scale(skin.shape.headScale, skin.shape.headScale);

    const yawRad = state.headYaw * 0.50;
    const pitchRad = state.headPitch * 0.36;

    drawEye3D(ctx, true, yawRad, pitchRad, state, eyeThemeName, skin);
    drawEye3D(ctx, false, yawRad, pitchRad, state, eyeThemeName, skin);

    if (skin.palette.nose || skin.palette.mouth) {
      ctx.save();
      if (skin.palette.nose) {
        const n = projectHead3D(0, 8.2, 29.0, yawRad, pitchRad);
        ctx.fillStyle = rgbaToCss(skin.palette.nose);
        ctx.beginPath();
        ctx.moveTo(n.x - 2.3, n.y - 1.1);
        ctx.quadraticCurveTo(n.x, n.y - 1.6, n.x + 2.3, n.y - 1.1);
        ctx.quadraticCurveTo(n.x + 1.8, n.y + 0.6, n.x, n.y + 1.5);
        ctx.quadraticCurveTo(n.x - 1.8, n.y + 0.6, n.x - 2.3, n.y - 1.1);
        ctx.closePath();
        ctx.fill();
      }
      if (skin.palette.mouth) {
        const mL = projectHead3D(-4.2, 12.2, 28.4, yawRad, pitchRad);
        const mM = projectHead3D(0, 11.2, 28.8, yawRad, pitchRad);
        const mR = projectHead3D(4.2, 12.2, 28.4, yawRad, pitchRad);
        ctx.strokeStyle = rgbaToCss(skin.palette.mouth);
        ctx.lineWidth = 1.05;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(mL.x, mL.y);
        ctx.quadraticCurveTo((mL.x + mM.x) * 0.5, mL.y + 1.6, mM.x, mM.y);
        ctx.quadraticCurveTo((mM.x + mR.x) * 0.5, mR.y + 1.6, mR.x, mR.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3D whiskers
    const wiggle = Math.sin(state.time * 4.5) * Math.max(state.petHead, state.petBody) * 1.2;
    ctx.strokeStyle = rgbaToCss(skin.palette.whiskers);
    ctx.lineWidth = 1.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const sign of [-1, 1]) {
      const rows = [
        [10.5, 36.5, 8.8 + wiggle],
        [14.2, 37.8, 14.2 + wiggle * 0.5],
        [18.0, 35.5, 19.6 - wiggle * 0.4]
      ];
      for (const [y0, xEnd, yEnd] of rows) {
        const p0 = projectHead3D(sign * 24.0, y0, 23.0, yawRad, pitchRad);
        const p2 = projectHead3D(sign * xEnd, yEnd, 14.0, yawRad, pitchRad);
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo((p0.x + p2.x) * 0.5, (p0.y + p2.y) * 0.5 - 0.8, p2.x, p2.y);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function quadPoint(p0, p1, p2, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
    };
  }

  function quadTangent(p0, p1, p2, t) {
    const mt = 1 - t;
    return {
      x: 2 * mt * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
      y: 2 * mt * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
    };
  }

  function drawLimb(ctx, start, control, end, startW, endW, outlineOnLeft, outlineAlpha, skin) {
    const pal = skin.palette;
    const steps = 14;
    const leftEdge = [], rightEdge = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = quadPoint(start, control, end, t);
      const tan = quadTangent(start, control, end, t);
      const len = Math.max(0.001, Math.hypot(tan.x, tan.y));
      const nx = -tan.y / len, ny = tan.x / len;
      const hw = (startW + (endW - startW) * t) * 0.5;
      leftEdge.push({ x: p.x + nx * hw, y: p.y + ny * hw });
      rightEdge.push({ x: p.x - nx * hw, y: p.y - ny * hw });
    }

    const traceLimb = () => {
      ctx.beginPath();
      ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
      for (let i = 1; i < leftEdge.length; i++) ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
      for (let i = rightEdge.length - 1; i >= 0; i--) ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
      const tan0 = quadTangent(start, control, end, 0);
      const len0 = Math.max(0.001, Math.hypot(tan0.x, tan0.y));
      ctx.quadraticCurveTo(
        start.x - (tan0.x / len0) * startW * 0.5,
        start.y - (tan0.y / len0) * startW * 0.5,
        leftEdge[0].x, leftEdge[0].y
      );
      ctx.closePath();
    };

    const pawR = endW * 0.58;
    const lineColor = pal.outline || pal.crease;

    ctx.save();
    if (pal.points) {
      const mid = pal.pointsMid || pal.points;
      ctx.save();
      traceLimb();
      ctx.clip();
      const g = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
      g.addColorStop(0.0, rgbaToCss(pal.body, 0));
      g.addColorStop(0.16, rgbaToCss(pal.body, 1));
      g.addColorStop(0.48, rgbaToCss(mid, 1));
      g.addColorStop(0.78, rgbaToCss(pal.points, 1));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 360, 320);
      ctx.restore();

      ctx.fillStyle = rgbaToCss(pal.paws);
      ctx.beginPath();
      ctx.ellipse(end.x, end.y, pawR, pawR * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      const outerEdge = outlineOnLeft ? rightEdge : leftEdge;
      ctx.strokeStyle = rgbaToCss(lineColor, 0.72);
      ctx.lineWidth = 1.25;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(outerEdge[3].x, outerEdge[3].y);
      for (let i = 4; i < outerEdge.length - 1; i++) ctx.lineTo(outerEdge[i].x, outerEdge[i].y);
      ctx.stroke();
    } else {
      traceLimb();
      if (pal.belly && !sameColor(pal.belly, pal.legs)) {
        ctx.save();
        ctx.clip();
        const g = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        g.addColorStop(0, rgbaToCss(pal.belly));
        g.addColorStop(0.30, rgbaToCss(pal.legs));
        g.addColorStop(1, rgbaToCss(pal.legs));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 360, 320);
        ctx.restore();
      } else {
        ctx.fillStyle = rgbaToCss(pal.legs);
        ctx.fill();
      }

      if (sameColor(pal.paws, pal.legs)) {
        ctx.fillStyle = rgbaToCss(pal.legs);
        ctx.beginPath();
        ctx.ellipse(end.x, end.y, pawR, pawR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const first = Math.floor(steps * 0.72);
        ctx.fillStyle = rgbaToCss(pal.paws);
        ctx.beginPath();
        ctx.moveTo(leftEdge[first].x, leftEdge[first].y);
        for (let i = first + 1; i < leftEdge.length; i++) ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
        for (let i = rightEdge.length - 1; i >= first; i--) ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(end.x, end.y, pawR, pawR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const highlightEdge = outlineOnLeft ? leftEdge : rightEdge;
    ctx.strokeStyle = skin.colorpoint ? rgbaToCss(lineColor, outlineAlpha * 0.78) : rgbaToCss(pal.crease, outlineAlpha * 0.9);
    ctx.lineWidth = 1.35;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(highlightEdge[2].x, highlightEdge[2].y);
    const endIdx = Math.floor((highlightEdge.length - 1) * 0.68);
    for (let i = 3; i <= endIdx; i++) ctx.lineTo(highlightEdge[i].x, highlightEdge[i].y);
    ctx.stroke();
    ctx.restore();
  }

  function drawIdleFrontLeg(ctx, top, bottom, isLeft, skin) {
    const pal = skin.palette;
    const sign = isLeft ? -1 : 1;
    ctx.save();

    const traceLeg = () => {
      const oTop = { x: top.x + sign * 8.5, y: top.y };
      const oCtrl = { x: top.x + sign * 9.5, y: (top.y + bottom.y) * 0.5 };
      const oBot = { x: bottom.x + sign * 7.5, y: bottom.y - 1 };
      const iBot = { x: bottom.x - sign * 6.0, y: bottom.y - 1 };
      const iCtrl = { x: top.x - sign * 6.5, y: (top.y + bottom.y) * 0.5 };
      const iTop = { x: top.x - sign * 7.0, y: top.y + 4 };
      ctx.beginPath();
      ctx.moveTo(oTop.x, oTop.y);
      ctx.quadraticCurveTo(oCtrl.x, oCtrl.y, oBot.x, oBot.y);
      ctx.quadraticCurveTo(bottom.x + sign * 7.0, bottom.y + 5.2, bottom.x + sign * 0.8, bottom.y + 5.2);
      ctx.quadraticCurveTo(bottom.x - sign * 6.2, bottom.y + 5.2, iBot.x, iBot.y);
      ctx.quadraticCurveTo(iCtrl.x, iCtrl.y, iTop.x, iTop.y);
      ctx.closePath();
    };

    if (pal.points) {
      const mid = pal.pointsMid || pal.points;
      ctx.save();
      roundedRectPath(ctx, bottom.x - 7.5, top.y, 15.0, bottom.y - top.y + 5.0, 6.5);
      ctx.clip();
      const g = ctx.createLinearGradient(top.x, top.y, bottom.x, bottom.y + 5.0);
      g.addColorStop(0.05, rgbaToCss(pal.body, 0));
      g.addColorStop(0.50, rgbaToCss(mid, 0.75));
      g.addColorStop(0.82, rgbaToCss(pal.points, 1));
      ctx.fillStyle = g;
      ctx.fillRect(bottom.x - 9, top.y - 1, 18, bottom.y - top.y + 8);
      ctx.restore();
    } else {
      // Smooth shoulder-fade leg fill so palette.legs shows cleanly on idle sitting legs too
      // ("idleLegs": "legs"; the built-in coats use "chest" and keep their approved look)
      if (skin.idleLegsTinted !== false) {
        ctx.save();
        traceLeg();
        ctx.clip();
        const g = ctx.createLinearGradient(top.x, top.y, bottom.x, bottom.y + 5.0);
        g.addColorStop(0.04, rgbaToCss(pal.legs, 0));
        g.addColorStop(0.32, rgbaToCss(pal.legs, 1));
        g.addColorStop(1.00, rgbaToCss(pal.legs, 1));
        ctx.fillStyle = g;
        ctx.fillRect(bottom.x - 14, top.y - 1, 28, bottom.y - top.y + 8);
        ctx.restore();
      }

      ctx.fillStyle = rgbaToCss(pal.paws);
      roundedRectPath(ctx, bottom.x - 7.5, bottom.y - 13, 15, 18, 6.5);
      ctx.fill();
    }

    ctx.strokeStyle = rgbaToCss(pal.crease);
    ctx.lineWidth = 1.45;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(top.x + sign * 8.5, top.y);
    ctx.quadraticCurveTo(top.x + sign * 9.5, (top.y + bottom.y) * 0.5, bottom.x + sign * 7.5, bottom.y - 1);
    ctx.moveTo(top.x - sign * 7.0, top.y + 4);
    ctx.quadraticCurveTo(top.x - sign * 6.5, (top.y + bottom.y) * 0.5, bottom.x - sign * 6.0, bottom.y - 1);
    ctx.stroke();
    ctx.restore();
  }

  function drawFrontPaws(ctx, seatX, seatY, breath, state, skin) {
    const bd = getBuild(skin);
    const bw = skin.shape.bodyWidth;
    const idleTopY = seatY - bd.idleTopDY;
    const idleTopX = bd.idleTopX * bw;
    const idleBotX = bd.idleBotX * bw;
    const shX = bd.shoulderX * bw;

    const sy = state.bodySquash, sx = 1 + (1 - sy) * 0.55;
    const c = Math.cos(state.bodyTilt), s = Math.sin(state.bodyTilt);
    const faceBottom = 126 + bd.headLift + state.headOffsetY + state.headPitch * 4.8 + breath * 1.1 + 42;
    const shoulder = (x) => ({
      x: seatX + x * sx * c + 58 * sy * s,
      y: Math.max(seatY + x * sx * s - 58 * sy * c, faceBottom)
    });

    const lPos = state.leftPaw, rPos = state.rightPaw;
    const lDist = Math.hypot(lPos.x - LEFT_PAW_REST.x, lPos.y - LEFT_PAW_REST.y);
    const rDist = Math.hypot(rPos.x - RIGHT_PAW_REST.x, rPos.y - RIGHT_PAW_REST.y);

    if (lDist < 6.0 && !state.leftPawActive) {
      drawIdleFrontLeg(ctx, { x: seatX - idleTopX, y: idleTopY }, { x: seatX - idleBotX, y: seatY + 12 }, true, skin);
    } else {
      const ls = shoulder(-shX);
      const mid = { x: (ls.x + lPos.x) * 0.5 - 6, y: (ls.y + lPos.y) * 0.5 - 6 };
      drawLimb(ctx, ls, mid, lPos, bd.limbStartW, bd.limbEndW, false, 0.78, skin);
    }

    if (rDist < 6.0 && !state.rightPawActive) {
      drawIdleFrontLeg(ctx, { x: seatX + idleTopX, y: idleTopY }, { x: seatX + idleBotX, y: seatY + 12 }, false, skin);
    } else {
      const rs = shoulder(shX);
      const mid = { x: (rs.x + rPos.x) * 0.5 + 4, y: (rs.y + rPos.y) * 0.5 - 6 };
      drawLimb(ctx, rs, mid, rPos, bd.limbStartW, bd.limbEndW, true, 0.78, skin);
    }
  }

  function drawScene(ctx, skin, state, options) {
    const opts = options || {};
    const kbTheme = opts.kbTheme || 'classicMilk';
    const eyeTheme = opts.eyeTheme || (skin.colorpoint ? 'siameseBlue' : 'neonChartreuse');

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const scaleX = ctx.canvas.width / 360;
    const scaleY = ctx.canvas.height / 320;
    ctx.scale(scaleX, scaleY);

    const breath = Math.sin(state.time * 2.1) * 1.6;
    const seatX = SEAT_ANCHOR.x + state.bodyShiftX;
    const seatY = SEAT_ANCHOR.y;
    const bd = getBuild(skin);
    const headCenter = {
      x: seatX + state.bodyTilt * 36 + state.headYaw * 7.5,
      y: 126 + bd.headLift + state.headOffsetY + state.headPitch * 4.8 + breath * 1.1
    };

    drawMouse(ctx, state, kbTheme);
    drawKeyboard(ctx, state, kbTheme, eyeTheme);
    drawTail(ctx, seatX, seatY, state, skin);

    // 3D ears
    ctx.save();
    ctx.translate(headCenter.x, headCenter.y);
    ctx.rotate(state.headTilt);
    if (skin.shape.headScale !== 1) ctx.scale(skin.shape.headScale, skin.shape.headScale);
    drawEar3D(ctx, true, state.headYaw * 0.50, state.headPitch * 0.36, state.earFold, state.earTwitch * 0.045, skin);
    drawEar3D(ctx, false, state.headYaw * 0.50, state.headPitch * 0.36, state.earFold, -state.earTwitch * 0.045, skin);
    ctx.restore();

    drawUnifiedSilhouette(ctx, seatX, seatY, headCenter, breath, state, skin);

    if (state.hindFootActive > 0.03) {
      const hip = { x: seatX + 26 * skin.shape.bodyWidth, y: seatY + 2 };
      const target = state.hindFoot;
      const mid = { x: (hip.x + target.x) * 0.5 + 10, y: (hip.y + target.y) * 0.5 - 8 };
      drawLimb(ctx, hip, mid, target, 15.0, 12.0, true, 0.85 * state.hindFootActive, skin);
    }

    drawHeadFeatures(ctx, headCenter, state, eyeTheme, skin);
    if (skin.decorations && skin.decorations.length > 0) {
      drawDecorations(ctx, seatX, seatY, headCenter, state, skin);
    }
    drawFrontPaws(ctx, seatX, seatY, breath, state, skin);

    // Sleep Z or petting sparkles
    if (state.sleepiness > 0.5) {
      const zPhase = (state.time * 0.7) % 1;
      ctx.save();
      ctx.fillStyle = `rgba(226,139,66,${Math.sin(zPhase * Math.PI).toFixed(2)})`;
      ctx.font = `700 ${11 + zPhase * 4}px -apple-system, sans-serif`;
      ctx.fillText('z', headCenter.x + 34 + zPhase * 12, headCenter.y - 34 - zPhase * 22);
      ctx.restore();
    }

    // Optional on-canvas Bezier anchor overlay when editing a region
    if (opts.editRegion && opts.editRegion.anchors) {
      drawRegionOverlay(ctx, opts.editRegion, skin, seatX, seatY, headCenter, state);
    }
    if (opts.pen) {
      drawPenOverlay(ctx, opts.pen, skin, seatX, seatY, headCenter, state);
    }
    if (typeof opts.editDecorationIndex === 'number' && opts.editDecorationIndex >= 0 &&
        skin.decorations && skin.decorations[opts.editDecorationIndex]) {
      drawDecorationOverlay(ctx, skin.decorations[opts.editDecorationIndex], skin, seatX, seatY, headCenter, state);
    }

    ctx.restore();
    return { seatX, seatY, headCenter };
  }

  function mapPointToCanvas(pt, space, skin, seatX, seatY, headCenter, state) {
    if (space === 'body') return bodyPoint(pt, skin, seatX, seatY, state);
    if (space === 'skull') return headPoint(pt, true, skin, headCenter, state);
    if (space === 'head') return headPoint(pt, false, skin, headCenter, state);
    if (space === 'tail') return tailCurve(seatX, seatY, state, skin).at(pt);
    return { x: headCenter.x + pt.x, y: headCenter.y + pt.y };
  }

  // canvas -> tail space: nearest station on the tail's centre curve, signed normal offset / thickness
  function mapCanvasToTail(canvasPt, skin, seatX, seatY, state) {
    const curve = tailCurve(seatX, seatY, state, skin);
    let best = null;
    for (let i = 0; i <= 200; i++) {
      const x = i * 0.5;
      const p = curve.at({ x, y: 0 });
      const d = (p.x - canvasPt.x) ** 2 + (p.y - canvasPt.y) ** 2;
      if (!best || d < best.d) best = { x, d, p };
    }
    const q = curve.at({ x: best.x, y: 1 });
    const nx = q.x - best.p.x, ny = q.y - best.p.y;
    const nn = Math.max(1e-6, nx * nx + ny * ny);
    return { x: best.x, y: ((canvasPt.x - best.p.x) * nx + (canvasPt.y - best.p.y) * ny) / nn };
  }

  function mapCanvasToSpace(canvasPt, space, skin, seatX, seatY, headCenter, state) {
    if (space === 'tail' && state) return mapCanvasToTail(canvasPt, skin, seatX, seatY, state);
    if (space === 'body') {
      return {
        x: (canvasPt.x - seatX) / skin.shape.bodyWidth,
        y: canvasPt.y - seatY
      };
    }
    return {
      x: (canvasPt.x - headCenter.x) / skin.shape.headScale,
      y: (canvasPt.y - headCenter.y) / skin.shape.headScale
    };
  }

  function drawRegionOverlay(ctx, rawRegion, skin, seatX, seatY, headCenter, state) {
    const map = (p) => mapPointToCanvas(p, rawRegion.space, skin, seatX, seatY, headCenter, state);
    const flat = global.KuroSpec.flattenRegion(rawRegion.anchors);

    ctx.save();
    drawPolyline(ctx, flat, true, map);
    ctx.strokeStyle = '#E28B42';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    rawRegion.anchors.forEach((a) => {
      const p = map(a);
      const pIn = map({ x: a.inX !== undefined ? a.inX : a.x, y: a.inY !== undefined ? a.inY : a.y });
      const pOut = map({ x: a.outX !== undefined ? a.outX : a.x, y: a.outY !== undefined ? a.outY : a.y });

      ctx.strokeStyle = 'rgba(226,139,66,0.75)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(pIn.x, pIn.y);
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(pOut.x, pOut.y);
      ctx.stroke();

      // Handles (small diamonds)
      for (const h of [pIn, pOut]) {
        if (Math.hypot(h.x - p.x, h.y - p.y) > 2) {
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E28B42';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.rect(h.x - 3, h.y - 3, 6, 6);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Main anchor circle
      ctx.fillStyle = '#E28B42';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  // Pen tool overlay: the curve being drawn, its anchors and handles, a rubber band to the cursor and,
  // for a split curve, dashed extensions to where the side regions close.
  function drawPenOverlay(ctx, pen, skin, seatX, seatY, headCenter, state) {
    const map = (p) => mapPointToCanvas(p, pen.space, skin, seatX, seatY, headCenter, state);
    const A = pen.anchors || [];
    const strokeTwice = (width) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = width + 2.2;
      ctx.stroke();
      ctx.strokeStyle = '#E28B42';
      ctx.lineWidth = width;
      ctx.stroke();
    };
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (pen.freehand && pen.freehand.length >= 2) {
      drawPolyline(ctx, pen.freehand, pen.freehandClosed === true, map);
      ctx.setLineDash([4, 3]);
      strokeTwice(1.5);
      if (pen.mirror) {
        const mir = pen.freehand.map((p) => ({ x: -p.x, y: p.y }));
        drawPolyline(ctx, mir, pen.freehandClosed === true, map);
        ctx.strokeStyle = 'rgba(226,139,66,0.7)';
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }
    if (pen.ends && pen.space !== 'tail') {
      ctx.setLineDash([3, 4]);
      for (const e of pen.ends) {
        const a = map(e.from), b = map(e.to);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(226,139,66,0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (pen.mirror && A.length >= 2) {
      // the mirrored half that will be added on the other side
      drawPolyline(ctx, global.KuroSpec.flattenOpen(global.KuroSpec.mirrorAnchors(A)), false, map);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(226,139,66,0.7)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (A.length >= 2) {
      const flat = global.KuroSpec.flattenOpen(A);
      drawPolyline(ctx, flat, pen.closedPreview === true, map);
      strokeTwice(1.8);
    }
    if (pen.stage === 'draw' && pen.hover && A.length) {
      const last = map(A[A.length - 1]);
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pen.hover.x, pen.hover.y);
      ctx.strokeStyle = 'rgba(226,139,66,0.85)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    A.forEach((a, i) => {
      const p = map(a);
      for (const key of ['in', 'out']) {
        const hx = a[key + 'X'], hy = a[key + 'Y'];
        if (hx === undefined || Math.hypot(hx - a.x, hy - a.y) < 0.3) continue;
        const h = map({ x: hx, y: hy });
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(h.x, h.y);
        ctx.strokeStyle = 'rgba(226,139,66,0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#E28B42';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.rect(h.x - 2.8, h.y - 2.8, 5.6, 5.6);
        ctx.fill();
        ctx.stroke();
      }
      const first = i === 0;
      if (first && pen.closeHint) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#E28B42';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, first ? 4.8 : 4.0, 0, Math.PI * 2);
      ctx.fillStyle = first ? '#FFFFFF' : '#E28B42';
      ctx.strokeStyle = first ? '#E28B42' : '#FFFFFF';
      ctx.lineWidth = 1.7;
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  // --- Decorations (anchored PNG stickers, exact parity with native CatRenderer.drawDecorations) ---
  const decoImageCache = new Map();

  function getDecorationImage(pngB64) {
    if (!pngB64) return null;
    let entry = decoImageCache.get(pngB64);
    if (!entry) {
      const img = new Image();
      entry = { img, loaded: false };
      img.onload = () => { entry.loaded = true; };
      img.src = pngB64.startsWith('data:') ? pngB64 : `data:image/png;base64,${pngB64}`;
      decoImageCache.set(pngB64, entry);
      if (decoImageCache.size > 64) {
        const firstKey = decoImageCache.keys().next().value;
        decoImageCache.delete(firstKey);
      }
    }
    return entry.img.complete && entry.img.naturalWidth > 0 ? entry.img : null;
  }

  function preloadDecorations(decorations) {
    if (!decorations) return;
    for (const d of decorations) {
      if (d && d.png) getDecorationImage(d.png);
    }
  }

  function getDecorationTransform(deco, skin, seatX, seatY, headCenter, state) {
    const yawRad = state.headYaw * 0.50;
    const pitchRad = state.headPitch * 0.36;
    let at = { x: headCenter.x, y: headCenter.y };
    let rot = 0, kx = 1, ky = 1;
    if (deco.anchor === 'headTop' || deco.anchor === 'face') {
      const baseY = deco.anchor === 'headTop' ? -30 : 4;
      at = headPoint({ x: deco.offsetX, y: baseY + deco.offsetY }, false, skin, headCenter, state);
      rot = state.headTilt;
      kx = Math.max(0.55, Math.cos(yawRad)) * skin.shape.headScale;
      ky = Math.max(0.70, Math.cos(pitchRad)) * skin.shape.headScale;
    } else if (deco.anchor === 'neck') {
      at = bodyPoint({ x: deco.offsetX, y: -64 + deco.offsetY }, skin, seatX, seatY, state);
      rot = state.bodyTilt;
    } else if (deco.anchor === 'tailTip') {
      const curve = tailCurve(seatX, seatY, state, skin);
      at = { x: curve.tip.x + deco.offsetX, y: curve.tip.y + deco.offsetY };
    }
    const img = getDecorationImage(deco.png);
    const w = img ? img.naturalWidth : 64;
    const h = img ? img.naturalHeight : 64;
    const scale = 0.5 * deco.scale; // 2x authored stickers: 1 image px = 0.5 canvas units
    return {
      at,
      totalRot: rot + (deco.rotation * Math.PI) / 180,
      sx: scale * kx,
      sy: scale * ky,
      w,
      h,
      img
    };
  }

  function drawDecorations(ctx, seatX, seatY, headCenter, state, skin) {
    for (const d of skin.decorations) {
      const tf = getDecorationTransform(d, skin, seatX, seatY, headCenter, state);
      if (!tf.img) continue;
      ctx.save();
      ctx.translate(tf.at.x, tf.at.y);
      ctx.rotate(tf.totalRot);
      ctx.scale(tf.sx, tf.sy);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tf.img, -tf.w * 0.5, -tf.h * 0.5, tf.w, tf.h);
      ctx.restore();
    }
  }

  function getDecorationOverlayGeometry(deco, skin, seatX, seatY, headCenter, state) {
    const tf = getDecorationTransform(deco, skin, seatX, seatY, headCenter, state);
    const hw = Math.max(12, tf.w * tf.sx * 0.5);
    const hh = Math.max(12, tf.h * tf.sy * 0.5);
    const c = Math.cos(tf.totalRot), s = Math.sin(tf.totalRot);
    const toCanvas = (lx, ly) => ({
      x: tf.at.x + lx * c - ly * s,
      y: tf.at.y + lx * s + ly * c
    });
    return {
      center: tf.at,
      hw,
      hh,
      rot: tf.totalRot,
      corners: [toCanvas(-hw, -hh), toCanvas(hw, -hh), toCanvas(hw, hh), toCanvas(-hw, hh)],
      scaleHandle: toCanvas(hw, hh),
      rotateHandle: toCanvas(0, -hh - 16),
      topMid: toCanvas(0, -hh)
    };
  }

  function drawDecorationOverlay(ctx, deco, skin, seatX, seatY, headCenter, state) {
    const g = getDecorationOverlayGeometry(deco, skin, seatX, seatY, headCenter, state);
    ctx.save();
    // Dashed amber selection box
    ctx.beginPath();
    ctx.moveTo(g.corners[0].x, g.corners[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(g.corners[i].x, g.corners[i].y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 3.0;
    ctx.stroke();
    ctx.strokeStyle = '#E28B42';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotate stem + handle
    ctx.beginPath();
    ctx.moveTo(g.topMid.x, g.topMid.y);
    ctx.lineTo(g.rotateHandle.x, g.rotateHandle.y);
    ctx.strokeStyle = '#E28B42';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(g.rotateHandle.x, g.rotateHandle.y, 5.0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#E28B42';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Bottom-right scale handle
    ctx.beginPath();
    ctx.arc(g.scaleHandle.x, g.scaleHandle.y, 5.2, 0, Math.PI * 2);
    ctx.fillStyle = '#E28B42';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }

  function createDefaultState() {
    return {
      time: 0,
      tailPhase: 0,
      bodyShiftX: 0,
      bodyTilt: 0,
      bodySquash: 1,
      headTilt: 0,
      headYaw: 0,
      headPitch: 0,
      headOffsetY: 0,
      earFold: 0,
      earTwitch: 0,
      eyeGazeX: 0,
      eyeGazeY: 0,
      pupilScale: 1,
      huntIntensity: 0,
      petHead: 0,
      petBody: 0,
      sleepiness: 0,
      blinkProgress: 0,
      mouseOffsetX: 0,
      mouseOffsetY: 0,
      mousePress: 0,
      leftPaw: { ...LEFT_PAW_REST },
      rightPaw: { ...RIGHT_PAW_REST },
      leftPawActive: false,
      rightPawActive: false,
      hindFoot: { ...HIND_FOOT_REST },
      hindFootActive: 0,
      keyGlow: {}
    };
  }

  // Render clean 360x320 idle preview PNG (base64 without data: prefix) for embedding in .kurocat
  function renderPreviewBase64(resolvedSkin, kbTheme, eyeTheme) {
    const off = document.createElement('canvas');
    off.width = 360;
    off.height = 320;
    const ctx = off.getContext('2d');
    const st = createDefaultState();
    st.time = 0.6;
    st.tailPhase = 0.9;
    drawScene(ctx, resolvedSkin, st, { kbTheme: kbTheme || 'classicMilk', eyeTheme });
    const dataUrl = off.toDataURL('image/png');
    return dataUrl.replace(/^data:image\/png;base64,/, '');
  }

  function registerKeyboardTheme(id, colors) {
    if (!id || !colors) return;
    KB_THEMES[id] = {
      mouseBody: colors.mouseBody || '#F4F2EC',
      mouseBorder: colors.mouseBorder || '#242429',
      wheel: colors.wheel || '#F5B029',
      base: colors.base || '#1A1A1F',
      deck: colors.deck || '#242429',
      key: colors.key || '#F7F6F0',
      keyBorder: colors.keyBorder || 'rgba(199,196,189,0.75)',
      accent: colors.accent || '#F7B329',
      darkText: colors.darkText !== false
    };
  }

  function getKeyboardThemeColors(id) {
    return KB_THEMES[id] || KB_THEMES.classicMilk;
  }

  // Dedicated zoomed-in 2.5D keyboard + mouse card renderer for Keyboard Plaza
  function drawKeyboardCardPreview(ctx, colors, glowId) {
    const tempId = '__plaza_kb_preview__';
    registerKeyboardTheme(tempId, colors);
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, cw, ch);
    // Zoom into the lower-left mouse (x~64..92) + keyboard (x~100..290, y~230..298)
    const scale = Math.min(cw / 254, ch / 114);
    ctx.translate(cw * 0.5 - 176 * scale, ch * 0.5 - 264 * scale);
    ctx.scale(scale, scale);
    const st = createDefaultState();
    if (glowId) st.keyGlow[glowId] = 0.85;
    drawMouse(ctx, st, tempId);
    drawKeyboard(ctx, st, tempId, 'warmAmber');
    ctx.restore();
  }

  global.KuroRenderer = {
    SEAT_ANCHOR,
    LEFT_PAW_REST,
    RIGHT_PAW_REST,
    HIND_FOOT_REST,
    MOUSE_BASE,
    KEYCAPS,
    screenQuadPoint,
    createDefaultState,
    drawScene,
    mapPointToCanvas,
    mapCanvasToSpace,
    mapCanvasToTail,
    preloadDecorations,
    getDecorationTransform,
    getDecorationOverlayGeometry,
    renderPreviewBase64,
    registerKeyboardTheme,
    getKeyboardThemeColors,
    drawKeyboardCardPreview
  };
})(window);
