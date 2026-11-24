import { useEffect, useRef } from "react";
// Port do KuroCat (github.com/chanke17/KuroCat-Workshop, MIT — ver src/kurocat/LICENSE-KuroCat).
// Os scripts originais são IIFEs que se penduram em window (KuroSpec, KuroRenderer).
import "./kurocat/spec.js";
import "./kurocat/decorations.js";
import "./kurocat/renderer.js";

// Mesmas dimensões da cena do workshop (360x320).
const W = 360;
const H = 320;
const CAT_X = 184; // ponto da cabeça dentro da cena
const CAT_Y = 130;
const TYPING_IDLE_MS = 1200; // tempo sem teclar até as patinhas pararem
const TAP_EVERY = 0.22; // segundos entre "toques" nas teclas
const PRESS_MS = 160; // tempo que o clique "aperta" o mouse da cena
const SURPRISE_MS = 700; // tempo com olhos arregalados depois de um clique
const NEAR_PX = 220; // distância (px da tela) em que o gato "se assusta" e arregala um pouco
const GRAB_MS = 1500; // quanto tempo a pata fica no mouse depois do último movimento

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;

/**
 * <KuroCat skin={...} /> — gatinho do KuroCat desenhado em canvas.
 *  - a cabeça e os olhos viram na direção do mouse (qualquer lugar da tela)
 *  - o gato empurra o mouse da mesa na direção do cursor
 *  - clicar faz ele apertar o mouse e arregalar os olhos
 *  - quando você digita, ele bate nas teclas do teclado da cena
 */
export default function KuroCat({ skin: skinRaw, width = 240, right = 16 }) {
  const canvasRef = useRef(null);
  const height = Math.round((width * H) / W);

  useEffect(() => {
    const Spec = window.KuroSpec;
    const R = window.KuroRenderer;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const skin = Spec.resolveSkin(skinRaw);
    R.preloadDecorations(skin.decorations);

    const st = R.createDefaultState();
    st.time = 0.6;
    st.tailPhase = 0.9;

    // alvo do olhar em coordenadas normalizadas (-1..1); ativo depois do primeiro movimento
    const ptr = { active: false, yaw: 0, pitch: 0, gazeX: 0, gazeY: 0, near: false };
    let typingUntil = 0;
    let tapTimer = 0;
    let nextBlink = 2.4;
    let pressUntil = 0;
    let surpriseUntil = 0;
    let grabUntil = 0; // enquanto o cursor se mexe, a pata esquerda vai até o mouse da mesa

    const onPointer = (e) => {
      grabUntil = performance.now() + GRAB_MS;
      // o gato olha pro cursor onde quer que ele esteja na tela, em pixels da tela
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + (rect.width * CAT_X) / W;
      const cy = rect.top + (rect.height * CAT_Y) / H;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      ptr.active = true;
      ptr.yaw = clamp(dx / 420, -1, 1);
      ptr.pitch = clamp(dy / 320, -1, 1);
      ptr.gazeX = clamp(dx / 260, -1, 1);
      ptr.gazeY = clamp(dy / 260, -1, 1);
      ptr.near = Math.hypot(dx, dy) < NEAR_PX;
    };

    const onDown = (e) => {
      onPointer(e);
      const now = performance.now();
      pressUntil = now + PRESS_MS;
      surpriseUntil = now + SURPRISE_MS;
    };

    const onKey = () => {
      if (performance.now() >= typingUntil) tapTimer = TAP_EVERY; // primeira batida já na hora
      typingUntil = performance.now() + TYPING_IDLE_MS;
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("keydown", onKey);

    let raf = 0;
    let last = performance.now();

    const tick = (ts) => {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const now = performance.now();
      st.time += dt;
      st.tailPhase += dt * 2.2;

      for (const k of Object.keys(st.keyGlow)) {
        st.keyGlow[k] = Math.max(0, st.keyGlow[k] - dt * 3.8);
        if (st.keyGlow[k] <= 0.01) delete st.keyGlow[k];
      }

      // piscada
      if (st.time >= nextBlink) {
        const el = st.time - nextBlink;
        if (el < 0.08) st.blinkProgress = el / 0.08;
        else if (el < 0.17) st.blinkProgress = 1 - (el - 0.08) / 0.09;
        else {
          st.blinkProgress = 0;
          nextBlink = st.time + 2.5 + Math.random() * 2.5;
        }
      }

      const k = Math.min(1, dt * 9);
      const typing = now < typingUntil;
      const grabbing = now < grabUntil && ptr.active;
      let tYaw = ptr.active ? ptr.yaw : Math.sin(st.time * 0.8) * 0.14;
      let tPitch = ptr.active ? ptr.pitch : 0;

      // mouse da mesa: a pata empurra na direção do cursor; clique aperta
      const tMouseX = ptr.active ? clamp(ptr.gazeX * 20, -20, 20) : 0;
      const tMouseY = ptr.active ? clamp(ptr.gazeY * 8, -8, 8) : 0;
      const tPress = now < pressUntil ? 1 : 0;

      if (typing) {
        tPitch = 0.28; // cabeça baixa olhando o teclado
        tapTimer += dt;
        if (tapTimer > TAP_EVERY) {
          tapTimer = 0;
          const cap = R.KEYCAPS[Math.floor(Math.random() * R.KEYCAPS.length)];
          st.keyGlow[cap.id] = 1.0;
          const pt = R.screenQuadPoint(1 - (cap.xUnits + cap.widthUnits * 0.5), 1 - (cap.row + 0.5) / 5);
          // a pata esquerda fica com o mouse enquanto ele está sendo usado
          if (pt.x < 188 && !grabbing) {
            st.leftPaw = pt;
            st.leftPawActive = true;
          } else {
            st.rightPaw = pt;
            st.rightPawActive = true;
          }
        }
      } else {
        st.leftPawActive = false;
        st.rightPawActive = false;
      }

      // pata esquerda em cima do mouse da mesa
      if (grabbing) {
        st.leftPawActive = true;
        st.leftPaw.x = lerp(st.leftPaw.x, R.MOUSE_BASE.x + tMouseX, k);
        st.leftPaw.y = lerp(st.leftPaw.y, R.MOUSE_BASE.y + tMouseY + tPress * 1.6 - 6, k);
      }

      // olhos: arregalam quando o cursor chega perto ou logo depois de um clique
      const tPupil = now < surpriseUntil ? 1.5 : ptr.near ? 1.15 : 1;

      st.headYaw = lerp(st.headYaw, tYaw, k);
      st.headPitch = lerp(st.headPitch, tPitch, k);
      st.headTilt = lerp(st.headTilt, tYaw * 0.06, k);
      st.bodyTilt = lerp(st.bodyTilt, tYaw * 0.04, k);
      st.eyeGazeX = lerp(st.eyeGazeX, ptr.active ? ptr.gazeX : tYaw, k);
      st.eyeGazeY = lerp(st.eyeGazeY, ptr.active ? ptr.gazeY : tPitch, k);
      st.mouseOffsetX = lerp(st.mouseOffsetX, tMouseX, k);
      st.mouseOffsetY = lerp(st.mouseOffsetY, tMouseY, k);
      st.mousePress = lerp(st.mousePress, tPress, k);
      st.pupilScale = lerp(st.pupilScale, tPupil, k);
      if (!st.leftPawActive) {
        st.leftPaw.x = lerp(st.leftPaw.x, R.LEFT_PAW_REST.x, k);
        st.leftPaw.y = lerp(st.leftPaw.y, R.LEFT_PAW_REST.y, k);
      }
      if (!st.rightPawActive) {
        st.rightPaw.x = lerp(st.rightPaw.x, R.RIGHT_PAW_REST.x, k);
        st.rightPaw.y = lerp(st.rightPaw.y, R.RIGHT_PAW_REST.y, k);
      }

      ctx.clearRect(0, 0, W, H);
      R.drawScene(ctx, skin, st, { kbTheme: "classicMilk", eyeTheme: "neonChartreuse" });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [skinRaw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        right,
        bottom: 16,
        width,
        height,
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}
