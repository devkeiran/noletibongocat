/* KuroCat Built-in Accessories & Custom Sticker Upload Processor (.kurocat v1 decorations) */
(function (global) {
  'use strict';

  const ANCHOR_META = {
    headTop: { label: '头顶', short: '头顶' },
    face: { label: '脸部', short: '脸部' },
    neck: { label: '颈部', short: '颈部' },
    tailTip: { label: '尾尖', short: '尾尖' }
  };

  // Helper: draw procedural 2x sticker onto offscreen canvas and return bare base64 PNG
  function renderVectorSticker(w, h, drawFn) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    drawFn(ctx, w, h);
    const dataUrl = c.toDataURL('image/png');
    return {
      png: dataUrl.replace(/^data:image\/png;base64,/, ''),
      dataUrl,
      width: w,
      height: h
    };
  }

  // 18 handcrafted KuroCat-style 2x accessories across all 4 native anchor points
  const BUILTIN_DEFS = [
    // --- 头顶 (headTop, baseY = -30 in head space) ---
    {
      id: 'crown',
      name: '小金皇冠',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: 0,
      offsetY: -12,
      scale: 0.92,
      rotation: -5,
      w: 112,
      h: 76,
      draw(ctx) {
        ctx.save();
        // Crown body
        ctx.beginPath();
        ctx.moveTo(16, 62);
        ctx.lineTo(10, 22);
        ctx.lineTo(36, 40);
        ctx.lineTo(56, 12);
        ctx.lineTo(76, 40);
        ctx.lineTo(102, 22);
        ctx.lineTo(96, 62);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 12, 0, 64);
        grad.addColorStop(0, '#FFE478');
        grad.addColorStop(0.6, '#F5B938');
        grad.addColorStop(1, '#DC9220');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#9C6214';
        ctx.lineWidth = 3.2;
        ctx.stroke();

        // Base rim
        ctx.beginPath();
        ctx.roundRect(14, 54, 84, 13, 6);
        ctx.fillStyle = '#E69F26';
        ctx.fill();
        ctx.stroke();

        // Top pearls
        for (const [px, py] of [[10, 20], [56, 10], [102, 20]]) {
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFF5C4';
          ctx.fill();
          ctx.strokeStyle = '#9C6214';
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
        // Jewels
        ctx.fillStyle = '#EA5B6C';
        ctx.beginPath(); ctx.arc(56, 43, 6.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6CCBF0';
        ctx.beginPath(); ctx.arc(32, 47, 4.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(80, 47, 4.4, 0, Math.PI * 2); ctx.fill();
        // Specular glints
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(54, 41, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    },
    {
      id: 'beret',
      name: '画家贝雷帽',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: 6,
      offsetY: -8,
      scale: 0.96,
      rotation: 9,
      w: 148,
      h: 78,
      draw(ctx) {
        ctx.save();
        // Little top stem
        ctx.strokeStyle = '#73302B';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(74, 20);
        ctx.quadraticCurveTo(79, 8, 86, 8);
        ctx.stroke();

        // Plump beret dome
        ctx.beginPath();
        ctx.moveTo(18, 52);
        ctx.bezierCurveTo(6, 26, 44, 12, 78, 14);
        ctx.bezierCurveTo(118, 16, 144, 34, 134, 56);
        ctx.quadraticCurveTo(76, 68, 18, 52);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, 14, 0, 66);
        g.addColorStop(0, '#D95B50');
        g.addColorStop(1, '#A93A32');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#732722';
        ctx.lineWidth = 3.2;
        ctx.stroke();

        // Soft top highlight
        ctx.fillStyle = 'rgba(255,225,215,0.28)';
        ctx.beginPath();
        ctx.ellipse(66, 30, 34, 9, -0.06, 0, Math.PI * 2);
        ctx.fill();

        // Rim band
        ctx.beginPath();
        ctx.moveTo(22, 54);
        ctx.quadraticCurveTo(76, 67, 130, 56);
        ctx.lineTo(127, 65);
        ctx.quadraticCurveTo(76, 75, 25, 63);
        ctx.closePath();
        ctx.fillStyle = '#8C2F28';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'topHat',
      name: '小绅士礼帽',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: 0,
      offsetY: -15,
      scale: 0.92,
      rotation: -6,
      w: 136,
      h: 96,
      draw(ctx) {
        ctx.save();
        // Brim
        ctx.beginPath();
        ctx.ellipse(68, 76, 58, 13, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2B282A';
        ctx.fill();
        ctx.strokeStyle = '#151315';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Crown cylinder
        ctx.beginPath();
        ctx.moveTo(32, 74);
        ctx.lineTo(26, 18);
        ctx.quadraticCurveTo(68, 9, 110, 18);
        ctx.lineTo(104, 74);
        ctx.quadraticCurveTo(68, 82, 32, 74);
        ctx.closePath();
        const g = ctx.createLinearGradient(26, 0, 110, 0);
        g.addColorStop(0, '#262326');
        g.addColorStop(0.35, '#423E42');
        g.addColorStop(1, '#1E1C1F');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.stroke();

        // Warm amber ribbon band
        ctx.beginPath();
        ctx.moveTo(31, 58);
        ctx.quadraticCurveTo(68, 66, 105, 58);
        ctx.lineTo(104, 72);
        ctx.quadraticCurveTo(68, 80, 32, 72);
        ctx.closePath();
        ctx.fillStyle = '#E8923E';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'pinkBow',
      name: '草莓蝴蝶结',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: 18,
      offsetY: -6,
      scale: 0.92,
      rotation: 16,
      w: 112,
      h: 72,
      draw(ctx) {
        ctx.save();
        const fillBow = (sign) => {
          ctx.beginPath();
          ctx.moveTo(56, 36);
          ctx.bezierCurveTo(56 + sign * 24, 6, 56 + sign * 52, 10, 56 + sign * 48, 36);
          ctx.bezierCurveTo(56 + sign * 52, 62, 56 + sign * 24, 66, 56, 36);
          ctx.closePath();
          ctx.fillStyle = '#FF8FA3';
          ctx.fill();
          ctx.strokeStyle = '#B84862';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Inner fold crease
          ctx.beginPath();
          ctx.moveTo(56 + sign * 12, 36);
          ctx.lineTo(56 + sign * 29, 32);
          ctx.strokeStyle = '#D9667F';
          ctx.lineWidth = 2.6;
          ctx.stroke();
        };
        fillBow(-1);
        fillBow(1);

        // Center knot
        ctx.beginPath();
        ctx.roundRect(45, 24, 22, 24, 10);
        ctx.fillStyle = '#FF6E88';
        ctx.fill();
        ctx.strokeStyle = '#B84862';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cute white dots
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        for (const [x, y] of [[24, 28], [32, 44], [88, 28], [80, 44]]) {
          ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    },
    {
      id: 'headphones',
      name: '电竞耳机',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: 0,
      offsetY: 22,
      scale: 0.96,
      rotation: 0,
      w: 204,
      h: 136,
      draw(ctx) {
        ctx.save();
        // Top arc headband
        ctx.beginPath();
        ctx.arc(102, 82, 74, Math.PI * 1.06, Math.PI * 1.94);
        ctx.strokeStyle = '#2B2D34';
        ctx.lineWidth = 14;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(102, 82, 74, Math.PI * 1.15, Math.PI * 1.85);
        ctx.strokeStyle = '#E8923E';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Ear cups
        for (const sign of [-1, 1]) {
          const cx = 102 + sign * 79;
          ctx.save();
          ctx.translate(cx, 88);
          ctx.rotate(sign * -0.10);
          // Soft cushion
          ctx.beginPath();
          ctx.roundRect(-14, -25, 28, 50, 12);
          ctx.fillStyle = '#3D404A';
          ctx.fill();
          ctx.strokeStyle = '#191B20';
          ctx.lineWidth = 3;
          ctx.stroke();
          // Outer shell
          ctx.beginPath();
          ctx.roundRect(sign > 0 ? -4 : -16, -21, 20, 42, 9);
          ctx.fillStyle = '#24262D';
          ctx.fill();
          ctx.stroke();
          // Glowing accent ring
          ctx.beginPath();
          ctx.roundRect(sign > 0 ? 4 : -10, -12, 6, 24, 3);
          ctx.fillStyle = '#C9F240';
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
    },
    {
      id: 'sprout',
      name: '幸运小发芽',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: 0,
      offsetY: -13,
      scale: 0.92,
      rotation: 0,
      w: 92,
      h: 78,
      draw(ctx) {
        ctx.save();
        // Stem
        ctx.strokeStyle = '#4B8B3B';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(46, 70);
        ctx.quadraticCurveTo(44, 48, 46, 34);
        ctx.stroke();

        // Left leaf
        ctx.beginPath();
        ctx.moveTo(46, 38);
        ctx.bezierCurveTo(32, 14, 10, 14, 10, 30);
        ctx.bezierCurveTo(10, 46, 34, 48, 46, 38);
        ctx.closePath();
        ctx.fillStyle = '#7ED457';
        ctx.fill();
        ctx.strokeStyle = '#3F7D2E';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Right leaf
        ctx.beginPath();
        ctx.moveTo(46, 36);
        ctx.bezierCurveTo(56, 8, 82, 10, 82, 26);
        ctx.bezierCurveTo(82, 42, 58, 46, 46, 36);
        ctx.closePath();
        ctx.fillStyle = '#92E368';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'sakura',
      name: '樱花小发卡',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: -24,
      offsetY: -4,
      scale: 0.88,
      rotation: -14,
      w: 84,
      h: 84,
      draw(ctx) {
        ctx.save();
        ctx.translate(42, 42);
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI * 2) / 5);
          ctx.beginPath();
          ctx.moveTo(0, -4);
          ctx.bezierCurveTo(-16, -12, -16, -34, -4, -34);
          ctx.lineTo(0, -28);
          ctx.lineTo(4, -34);
          ctx.bezierCurveTo(16, -34, 16, -12, 0, -4);
          ctx.closePath();
          ctx.fillStyle = '#FFB7C8';
          ctx.fill();
          ctx.strokeStyle = '#D66D88';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFE278';
        ctx.fill();
        ctx.strokeStyle = '#D68A2E';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'halo',
      name: '小天使光环',
      category: 'headTop',
      anchor: 'headTop',
      offsetX: 0,
      offsetY: -22,
      scale: 0.96,
      rotation: 0,
      w: 132,
      h: 52,
      draw(ctx) {
        ctx.save();
        // Soft glow
        ctx.strokeStyle = 'rgba(255, 224, 102, 0.42)';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.ellipse(66, 26, 48, 13, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#FFD84D';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(66, 26, 48, 13, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#FFF8CC';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(66, 24.5, 46, 11.5, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        ctx.restore();
      }
    },

    // --- 脸部 (face, baseY = +4 in head space; eyes are at (±17.2, -2), so yOffset = -6 hits exact eye line!) ---
    {
      id: 'sunglasses',
      name: '酷酷墨镜',
      category: 'face',
      anchor: 'face',
      offsetX: 0,
      offsetY: -6,
      scale: 1.0,
      rotation: 0,
      w: 146,
      h: 56,
      draw(ctx) {
        ctx.save();
        // Bridge
        ctx.strokeStyle = '#1A1A1E';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(58, 22);
        ctx.quadraticCurveTo(73, 17, 88, 22);
        ctx.stroke();

        // Lenses
        for (const [lx, sign] of [[10, -1], [84, 1]]) {
          ctx.beginPath();
          ctx.roundRect(lx, 10, 52, 36, [8, 8, 16, 16]);
          const g = ctx.createLinearGradient(lx, 10, lx, 46);
          g.addColorStop(0, '#363A45');
          g.addColorStop(1, '#14151A');
          ctx.fillStyle = g;
          ctx.fill();
          ctx.strokeStyle = '#101014';
          ctx.lineWidth = 3.6;
          ctx.stroke();

          // Diagonal specular stripe
          ctx.strokeStyle = 'rgba(255,255,255,0.42)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(lx + 11, 36);
          ctx.lineTo(lx + 27, 17);
          ctx.stroke();
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(lx + 24, 38);
          ctx.lineTo(lx + 37, 22);
          ctx.stroke();
        }
        ctx.restore();
      }
    },
    {
      id: 'roundGlasses',
      name: '金丝圆眼镜',
      category: 'face',
      anchor: 'face',
      offsetX: 0,
      offsetY: -6,
      scale: 1.0,
      rotation: 0,
      w: 146,
      h: 62,
      draw(ctx) {
        ctx.save();
        // Subtle lens tint
        for (const cx of [38, 108]) {
          ctx.beginPath();
          ctx.arc(cx, 31, 25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(235, 248, 255, 0.22)';
          ctx.fill();
          ctx.strokeStyle = '#D49A38';
          ctx.lineWidth = 4.2;
          ctx.stroke();
          // Tiny glass glint
          ctx.strokeStyle = 'rgba(255,255,255,0.68)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, 31, 17, Math.PI * 1.15, Math.PI * 1.42);
          ctx.stroke();
        }
        // Bridge
        ctx.strokeStyle = '#D49A38';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(63, 29);
        ctx.quadraticCurveTo(73, 23, 83, 29);
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'blush',
      name: '害羞粉腮红',
      category: 'face',
      anchor: 'face',
      offsetX: 0,
      offsetY: 8,
      scale: 1.0,
      rotation: 0,
      w: 148,
      h: 36,
      draw(ctx) {
        ctx.save();
        for (const cx of [26, 122]) {
          const g = ctx.createRadialGradient(cx, 18, 2, cx, 18, 22);
          g.addColorStop(0, 'rgba(255, 130, 150, 0.72)');
          g.addColorStop(1, 'rgba(255, 130, 150, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(cx, 18, 22, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(232, 82, 112, 0.65)';
          ctx.lineWidth = 2.4;
          for (const dx of [-6, 0, 6]) {
            ctx.beginPath();
            ctx.moveTo(cx + dx - 2, 22);
            ctx.lineTo(cx + dx + 3, 14);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    },
    {
      id: 'bandaid',
      name: '呆萌创可贴',
      category: 'face',
      anchor: 'face',
      offsetX: 24,
      offsetY: 11,
      scale: 0.78,
      rotation: -18,
      w: 76,
      h: 34,
      draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(6, 5, 64, 24, 12);
        ctx.fillStyle = '#F2C9A2';
        ctx.fill();
        ctx.strokeStyle = '#B8845A';
        ctx.lineWidth = 2.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(26, 7, 24, 20, 4);
        ctx.fillStyle = '#FFF5E8';
        ctx.fill();
        ctx.fillStyle = '#C9956A';
        for (const [x, y] of [[15, 13], [15, 21], [61, 13], [61, 21]]) {
          ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    },

    // --- 颈部 (neck, baseY = -64 in body space) ---
    {
      id: 'bellCollar',
      name: '红项圈金铃铛',
      category: 'neck',
      anchor: 'neck',
      offsetX: 0,
      offsetY: 2,
      scale: 0.96,
      rotation: 0,
      w: 174,
      h: 64,
      draw(ctx) {
        ctx.save();
        // Curved collar strap
        ctx.beginPath();
        ctx.moveTo(14, 16);
        ctx.quadraticCurveTo(87, 46, 160, 16);
        ctx.lineTo(156, 30);
        ctx.quadraticCurveTo(87, 60, 18, 30);
        ctx.closePath();
        ctx.fillStyle = '#D9433A';
        ctx.fill();
        ctx.strokeStyle = '#85221C';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Golden bell
        ctx.beginPath();
        ctx.arc(87, 45, 14, 0, Math.PI * 2);
        const bg = ctx.createRadialGradient(82, 40, 2, 87, 45, 15);
        bg.addColorStop(0, '#FFF199');
        bg.addColorStop(0.55, '#F5BD38');
        bg.addColorStop(1, '#C98418');
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = '#8A560E';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Bell slit
        ctx.strokeStyle = '#754708';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(76, 48);
        ctx.quadraticCurveTo(87, 52, 98, 48);
        ctx.stroke();
        ctx.fillStyle = '#754708';
        ctx.beginPath(); ctx.arc(87, 52, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    },
    {
      id: 'redScarf',
      name: '暖冬小红围巾',
      category: 'neck',
      anchor: 'neck',
      offsetX: 0,
      offsetY: 12,
      scale: 0.98,
      rotation: 0,
      w: 186,
      h: 96,
      draw(ctx) {
        ctx.save();
        // Hanging tail on right
        ctx.beginPath();
        ctx.moveTo(116, 36);
        ctx.quadraticCurveTo(132, 62, 128, 84);
        ctx.lineTo(100, 82);
        ctx.quadraticCurveTo(104, 60, 96, 38);
        ctx.closePath();
        ctx.fillStyle = '#C93832';
        ctx.fill();
        ctx.strokeStyle = '#7A1E1B';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Stripes & fringe
        ctx.strokeStyle = '#F7DFB2';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(102, 70); ctx.lineTo(126, 72);
        ctx.stroke();
        ctx.strokeStyle = '#A62B26';
        ctx.lineWidth = 3;
        for (const fx of [104, 111, 118, 125]) {
          ctx.beginPath(); ctx.moveTo(fx, 83); ctx.lineTo(fx, 92); ctx.stroke();
        }

        // Main wrapped neck tube
        ctx.beginPath();
        ctx.moveTo(16, 14);
        ctx.quadraticCurveTo(93, 38, 170, 14);
        ctx.quadraticCurveTo(174, 34, 162, 42);
        ctx.quadraticCurveTo(93, 62, 24, 42);
        ctx.quadraticCurveTo(12, 34, 16, 14);
        ctx.closePath();
        const sg = ctx.createLinearGradient(0, 14, 0, 58);
        sg.addColorStop(0, '#E44B42');
        sg.addColorStop(1, '#B8302A');
        ctx.fillStyle = sg;
        ctx.fill();
        ctx.strokeStyle = '#7A1E1B';
        ctx.lineWidth = 3.2;
        ctx.stroke();

        // Cozy knit lines
        ctx.strokeStyle = 'rgba(255,220,200,0.32)';
        ctx.lineWidth = 2.4;
        for (const kx of [44, 72, 100, 128, 148]) {
          ctx.beginPath();
          ctx.moveTo(kx, 26); ctx.lineTo(kx - 3, 44);
          ctx.stroke();
        }
        ctx.restore();
      }
    },
    {
      id: 'bowtie',
      name: '绅士红领结',
      category: 'neck',
      anchor: 'neck',
      offsetX: 0,
      offsetY: 3,
      scale: 0.92,
      rotation: 0,
      w: 102,
      h: 58,
      draw(ctx) {
        ctx.save();
        for (const sign of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(51, 29);
          ctx.lineTo(51 + sign * 42, 10);
          ctx.quadraticCurveTo(51 + sign * 48, 29, 51 + sign * 42, 48);
          ctx.closePath();
          ctx.fillStyle = '#D63D44';
          ctx.fill();
          ctx.strokeStyle = '#7D1E24';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.roundRect(42, 18, 18, 22, 7);
        ctx.fillStyle = '#B82E36';
        ctx.fill();
        ctx.strokeStyle = '#7D1E24';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'necktie',
      name: '打工人小领带',
      category: 'neck',
      anchor: 'neck',
      offsetX: 0,
      offsetY: 16,
      scale: 0.90,
      rotation: 0,
      w: 58,
      h: 102,
      draw(ctx) {
        ctx.save();
        // Blade
        ctx.beginPath();
        ctx.moveTo(22, 24);
        ctx.lineTo(36, 24);
        ctx.lineTo(44, 78);
        ctx.lineTo(29, 94);
        ctx.lineTo(14, 78);
        ctx.closePath();
        ctx.fillStyle = '#334E7B';
        ctx.fill();
        ctx.strokeStyle = '#1B2A45';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Diagonal gold stripes
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = '#F2BD4B';
        ctx.lineWidth = 5;
        for (const sy of [34, 54, 74]) {
          ctx.beginPath();
          ctx.moveTo(8, sy + 12);
          ctx.lineTo(52, sy - 6);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = '#1B2A45';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Knot
        ctx.beginPath();
        ctx.moveTo(16, 10);
        ctx.lineTo(42, 10);
        ctx.lineTo(36, 27);
        ctx.lineTo(22, 27);
        ctx.closePath();
        ctx.fillStyle = '#294066';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    },

    // --- 尾尖 (tailTip) ---
    {
      id: 'tailRibbon',
      name: '尾尖蝴蝶结',
      category: 'tailTip',
      anchor: 'tailTip',
      offsetX: -4,
      offsetY: -2,
      scale: 0.78,
      rotation: -18,
      w: 92,
      h: 72,
      draw(ctx) {
        ctx.save();
        // Trailing tails
        ctx.strokeStyle = '#4FB5A8';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(46, 36); ctx.quadraticCurveTo(36, 54, 24, 62);
        ctx.moveTo(46, 36); ctx.quadraticCurveTo(56, 54, 68, 62);
        ctx.stroke();

        for (const sign of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(46, 32);
          ctx.bezierCurveTo(46 + sign * 20, 8, 46 + sign * 40, 12, 46 + sign * 36, 32);
          ctx.bezierCurveTo(46 + sign * 40, 50, 46 + sign * 20, 52, 46, 32);
          ctx.closePath();
          ctx.fillStyle = '#70D1C4';
          ctx.fill();
          ctx.strokeStyle = '#337F76';
          ctx.lineWidth = 2.8;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(46, 32, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#4FB5A8';
        ctx.fill();
        ctx.strokeStyle = '#337F76';
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'tailStar',
      name: '尾尖小星星',
      category: 'tailTip',
      anchor: 'tailTip',
      offsetX: 6,
      offsetY: -4,
      scale: 0.80,
      rotation: 12,
      w: 76,
      h: 76,
      draw(ctx) {
        ctx.save();
        ctx.translate(38, 38);
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 30 : 14;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const g = ctx.createLinearGradient(0, -30, 0, 30);
        g.addColorStop(0, '#FFF18A');
        g.addColorStop(1, '#F5B52E');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#A86E14';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    }
  ];

  let cachedBuiltins = null;
  function getBuiltins() {
    if (!cachedBuiltins) {
      cachedBuiltins = BUILTIN_DEFS.map((def) => {
        const rendered = renderVectorSticker(def.w, def.h, def.draw);
        return {
          id: def.id,
          name: def.name,
          category: def.category,
          anchor: def.anchor,
          offsetX: def.offsetX,
          offsetY: def.offsetY,
          scale: def.scale,
          rotation: def.rotation,
          png: rendered.png,
          dataUrl: rendered.dataUrl,
          width: rendered.width,
          height: rendered.height
        };
      });
    }
    return cachedBuiltins;
  }

  // Edge flood-fill background remover (strips solid white / solid border background without touching interior white)
  function removeEdgeBackground(imgData, tolerance) {
    const { data, width: w, height: h } = imgData;
    const tol = tolerance || 34;

    // Sample corner pixels; if corners are already transparent, skip removal
    const corners = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]
    ];
    let opaqueCorners = 0;
    let sr = 0, sg = 0, sb = 0;
    for (const [cx, cy] of corners) {
      const i = (cy * w + cx) * 4;
      if (data[i + 3] > 200) {
        opaqueCorners++;
        sr += data[i]; sg += data[i + 1]; sb += data[i + 2];
      }
    }
    if (opaqueCorners < 2) return imgData;
    const bgR = sr / opaqueCorners, bgG = sg / opaqueCorners, bgB = sb / opaqueCorners;

    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qh = 0, qt = 0;

    const matchBg = (idx) => {
      const a = data[idx + 3];
      if (a < 20) return true;
      const dr = data[idx] - bgR, dg = data[idx + 1] - bgG, db = data[idx + 2] - bgB;
      return Math.hypot(dr, dg, db) <= tol;
    };

    const seed = (x, y) => {
      const p = y * w + x;
      if (visited[p]) return;
      if (matchBg(p * 4)) {
        visited[p] = 1;
        queue[qt++] = p;
      }
    };

    for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
    for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

    while (qh < qt) {
      const p = queue[qh++];
      const x = p % w, y = (p - x) / w;
      data[p * 4 + 3] = 0;
      if (x > 0) seed(x - 1, y);
      if (x + 1 < w) seed(x + 1, y);
      if (y > 0) seed(x, y - 1);
      if (y + 1 < h) seed(x, y + 1);
    }

    // Softly feather 1-pixel fringe adjacent to removed background
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        if (visited[p] || data[p * 4 + 3] < 20) continue;
        if (visited[p - 1] || visited[p + 1] || visited[p - w] || visited[p + w]) {
          const d = Math.hypot(data[p * 4] - bgR, data[p * 4 + 1] - bgG, data[p * 4 + 2] - bgB);
          if (d < tol * 1.45) {
            data[p * 4 + 3] = Math.round(data[p * 4 + 3] * Math.max(0.15, (d - tol * 0.7) / (tol * 0.75)));
          }
        }
      }
    }
    return imgData;
  }

  // Auto-trim transparent borders so dragging & rotating centers cleanly on the sticker artwork
  function trimTransparentCanvas(srcCanvas) {
    const w = srcCanvas.width, h = srcCanvas.height;
    const ctx = srcCanvas.getContext('2d', { willReadFrequently: true });
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 12) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) return srcCanvas;
    const pad = 4;
    const tx = Math.max(0, minX - pad);
    const ty = Math.max(0, minY - pad);
    const tw = Math.min(w - tx, maxX - minX + 1 + pad * 2);
    const th = Math.min(h - ty, maxY - minY + 1 + pad * 2);
    const out = document.createElement('canvas');
    out.width = tw;
    out.height = th;
    out.getContext('2d').drawImage(srcCanvas, tx, ty, tw, th, 0, 0, tw, th);
    return out;
  }

  // Convert an uploaded image File (PNG/JPG/WebP/SVG) into a valid, compact 2x .kurocat PNG sticker
  function processUploadedFile(file, options) {
    const opts = Object.assign({
      anchor: 'headTop',
      removeBg: false,
      tolerance: 36,
      maxDim: 220
    }, options || {});

    return new Promise((resolve, reject) => {
      if (!file || (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name || ''))) {
        reject(new Error('请上传 PNG / WebP / JPG / SVG 图片'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('读取图片失败'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('无法解析这张图片'));
        img.onload = () => {
          const nw = img.naturalWidth || img.width || 128;
          const nh = img.naturalHeight || img.height || 128;
          const scale = Math.min(1, opts.maxDim / Math.max(nw, nh));
          const dw = Math.max(8, Math.round(nw * scale));
          const dh = Math.max(8, Math.round(nh * scale));

          const work = document.createElement('canvas');
          work.width = dw;
          work.height = dh;
          const ctx = work.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, dw, dh);

          if (opts.removeBg) {
            const id = ctx.getImageData(0, 0, dw, dh);
            removeEdgeBackground(id, opts.tolerance);
            ctx.putImageData(id, 0, 0);
          }

          const trimmed = trimTransparentCanvas(work);
          const dataUrl = trimmed.toDataURL('image/png');
          const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');

          // Pick a pleasant default scale so the uploaded sticker sits around ~56 canvas units wide
          const desiredUnits = opts.anchor === 'tailTip' ? 38 : (opts.anchor === 'face' ? 58 : 64);
          const initialScale = Math.round(Math.min(2.0, Math.max(0.25, desiredUnits / Math.max(1, Math.max(trimmed.width, trimmed.height) * 0.5))) * 100) / 100;
          const defaultOffsetY = opts.anchor === 'headTop' ? -10 : (opts.anchor === 'face' ? -4 : 0);
          const cleanName = (file.name || '自定义配饰').replace(/\.[^.]+$/, '').slice(0, 18);

          resolve({
            _label: cleanName || '自定义配饰',
            png: b64,
            anchor: opts.anchor,
            offsetX: 0,
            offsetY: defaultOffsetY,
            scale: initialScale,
            rotation: 0
          });
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  global.KuroDecorations = {
    ANCHOR_META,
    getBuiltins,
    processUploadedFile
  };
})(window);
