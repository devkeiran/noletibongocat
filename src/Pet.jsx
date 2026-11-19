import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import "./Pet.css";

/**
 * <Pet /> — bichinho interativo que vive por cima da página.
 *
 *  - olha (vira a cabeça) na direção do mouse
 *  - pode ser arrastado (as antenas balançam com a inércia)
 *  - passeia sozinho de vez em quando        (prop `wander`)
 *  - segue o cursor de longe                 (prop `follow`)
 *  - clique = reação com balão de fala
 *  - dorme depois de um tempo sem atividade e acorda ao mexer o mouse
 *
 * Imagens esperadas em /public/pet/: body.webp, antenna-l.webp, antenna-r.webp
 * (todas com o mesmo tamanho/canvas, então empilham sem ajuste).
 */

const BASE = import.meta.env.BASE_URL ?? "/";
const IMG = {
  body: `${BASE}pet/body.webp`,
  left: `${BASE}pet/antenna-l.webp`,
  right: `${BASE}pet/antenna-r.webp`,
};

const PHRASES = [
  "miau?",
  "eu venho em paz 👽",
  "tá me olhando?",
  "💚",
  "leva eu pra Terra?",
  "trabalha, humano",
  "bip bop",
  "me dá um petisco",
];

// pivô das antenas (posição da base de cada uma dentro da imagem 736x736)
const PIVOT_L = "26.9% 32.6%";
const PIVOT_R = "54.6% 32.6%";

const SLEEP_AFTER_MS = 25_000;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);

function getBounds(size) {
  return {
    left: 0,
    top: 0,
    right: Math.max(0, window.innerWidth - size),
    // deixa ele "espiar" pela borda de baixo (a foto é cortada embaixo)
    bottom: Math.max(0, window.innerHeight - size * 0.82),
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = (e) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export default function Pet({ size = 200, wander = true, follow = false, margin = 24 }) {
  const reduced = usePrefersReducedMotion();
  const controls = useDragControls();

  const [bounds, setBounds] = useState(() => getBounds(size));
  const [bubble, setBubble] = useState(null);
  const [asleep, setAsleep] = useState(false);
  const [dragging, setDragging] = useState(false);

  // refs "vivos" lidos dentro de timers/loops sem re-render
  const live = useRef({ dragging: false, asleep: false, wander, follow, reduced, size });
  live.current.wander = wander && !reduced;
  live.current.follow = follow && !reduced;
  live.current.reduced = reduced;
  live.current.size = size;

  // ---- posição (px, coordenadas da janela) ----
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const hop = useMotionValue(0);
  const squash = useMotionValue(1);
  const breath = useMotionValue(1);
  const sleepAmt = useMotionValue(0);
  const mouse = useRef({ x: -1, y: -1 });

  // ---- olhar para o mouse (-1..1) ----
  const lookXRaw = useMotionValue(0);
  const lookYRaw = useMotionValue(0);
  const lookX = useSpring(lookXRaw, { stiffness: 110, damping: 16 });
  const lookY = useSpring(lookYRaw, { stiffness: 110, damping: 16 });

  // ---- antenas: molas movidas pela velocidade do pet + balanço ocioso ----
  const vx = useVelocity(x);
  const swayTarget = useTransform(vx, (v) => clamp(-v * 0.022, -28, 28));
  const sway = useSpring(swayTarget, { stiffness: 85, damping: 5, mass: 0.6 });
  const wobL = useMotionValue(0);
  const wobR = useMotionValue(0);
  const antL = useTransform([sway, wobL], ([s, w]) => s + w);
  const antR = useTransform([sway, wobR], ([s, w]) => s * 0.9 + w);

  // ---- transformações compostas ----
  const hopScaleY = useTransform([breath, squash], ([b, s]) => b * s);
  const hopScaleX = useTransform(squash, (s) => 2 - s);
  const rotY = useTransform(lookX, (v) => v * 16);
  const rotX = useTransform([lookY, sleepAmt], ([v, s]) => -v * 11 + s * 16);
  const rotZ = useTransform([lookX, sway, sleepAmt], ([v, s, z]) => v * 4 - s * 0.3 + z * 9);
  const headY = useTransform(sleepAmt, (s) => s * 10);

  const anims = useRef([]);
  const stopAnims = () => {
    anims.current.forEach((a) => a.stop());
    anims.current = [];
    animate(hop, 0, { duration: 0.15 });
  };

  // ---------- posição inicial + resize ----------
  useEffect(() => {
    const b = getBounds(size);
    x.set(clamp(window.innerWidth - size - margin, 0, b.right));
    y.set(clamp(window.innerHeight - size * 0.9 - margin, 0, b.bottom));
    setBounds(b);
    const onResize = () => {
      const nb = getBounds(live.current.size);
      setBounds(nb);
      x.set(clamp(x.get(), nb.left, nb.right));
      y.set(clamp(y.get(), nb.top, nb.bottom));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  // ---------- respiração e balanço das antenas ----------
  useEffect(() => {
    if (reduced) return;
    const opts = { repeat: Infinity, repeatType: "mirror", ease: "easeInOut" };
    const a = [
      animate(breath, 1.022, { ...opts, duration: 1.9 }),
      animate(wobL, [-3, 4], { ...opts, duration: 1.7 }),
      animate(wobR, [4, -3], { ...opts, duration: 2.1 }),
    ];
    return () => a.forEach((c) => c.stop());
  }, [reduced, breath, wobL, wobR]);

  // ---------- sono ----------
  const sleepTimer = useRef();
  const wake = useCallback(() => {
    clearTimeout(sleepTimer.current);
    if (live.current.asleep) {
      live.current.asleep = false;
      setAsleep(false);
      animate(sleepAmt, 0, { type: "spring", stiffness: 160, damping: 14 });
      animate(hop, [0, -16, 0], { duration: 0.35 });
      say("!");
    }
    sleepTimer.current = setTimeout(() => {
      if (live.current.dragging) return;
      stopAnims();
      live.current.asleep = true;
      setAsleep(true);
      animate(sleepAmt, 1, { type: "spring", stiffness: 40, damping: 16 });
    }, SLEEP_AFTER_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- balão de fala ----------
  const bubbleTimer = useRef();
  function say(text, ms = 2200) {
    clearTimeout(bubbleTimer.current);
    setBubble({ text, id: Math.random() });
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }

  // ---------- mouse: olhar + acordar ----------
  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (live.current.asleep) {
        wake();
        return;
      }
      const s = live.current.size;
      const cx = x.get() + s / 2;
      const cy = y.get() + s * 0.6;
      lookXRaw.set(clamp((e.clientX - cx) / 320, -1, 1));
      lookYRaw.set(clamp((e.clientY - cy) / 240, -1, 1));
      wake();
    };
    const onAny = () => wake();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onAny);
    window.addEventListener("pointerdown", onAny);
    wake();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onAny);
      window.removeEventListener("pointerdown", onAny);
      clearTimeout(sleepTimer.current);
      clearTimeout(bubbleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- passear sozinho ----------
  useEffect(() => {
    let t;
    const walkTo = (tx, ty) => {
      stopAnims();
      const dist = Math.hypot(tx - x.get(), ty - y.get());
      const duration = clamp(dist / 170, 0.9, 3.6);
      anims.current = [
        animate(x, tx, { duration, ease: "easeInOut" }),
        animate(y, ty, { duration, ease: "easeInOut" }),
        animate(hop, [0, -14, 0], { duration: 0.46, repeat: Math.max(1, Math.round(duration / 0.46)), ease: "easeOut" }),
      ];
      return duration;
    };
    const tick = () => {
      const L = live.current;
      let wait = rand(2500, 6500);
      if (L.wander && !L.follow && !L.dragging && !L.asleep) {
        const b = getBounds(L.size);
        const d = walkTo(rand(b.left, b.right), rand(b.top + (b.bottom - b.top) * 0.35, b.bottom));
        wait = d * 1000 + rand(2500, 6000);
        if (Math.random() < 0.3) setTimeout(() => say(PHRASES[Math.floor(rand(0, PHRASES.length))]), d * 1000);
      }
      t = setTimeout(tick, wait);
    };
    t = setTimeout(tick, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- seguir o cursor ----------
  useEffect(() => {
    let raf;
    let lastHop = 0;
    const loop = (now) => {
      const L = live.current;
      if (L.follow && !L.dragging && !L.asleep && mouse.current.x >= 0) {
        const s = L.size;
        const b = getBounds(s);
        // fica a ~130px do cursor, do lado "de baixo-direita"
        const tx = clamp(mouse.current.x + 90 - s / 2, b.left, b.right);
        const ty = clamp(mouse.current.y + 60 - s * 0.45, b.top, b.bottom);
        const dx = tx - x.get();
        const dy = ty - y.get();
        const dist = Math.hypot(dx, dy);
        if (dist > 70) {
          x.set(x.get() + dx * 0.035);
          y.set(y.get() + dy * 0.035);
          if (now - lastHop > 450) {
            lastHop = now;
            animate(hop, [0, -10, 0], { duration: 0.4, ease: "easeOut" });
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [x, y, hop]);

  // ---------- interações ----------
  const onDragStart = () => {
    stopAnims();
    live.current.dragging = true;
    setDragging(true);
    setBubble(null);
    animate(squash, 1.07, { type: "spring", stiffness: 300, damping: 12 });
    if (Math.random() < 0.5) say(["uiii!", "me solta!", "ei!", "tô voando 🚀"][Math.floor(rand(0, 4))], 1600);
  };
  const onDragEnd = () => {
    live.current.dragging = false;
    setDragging(false);
    animate(squash, [0.88, 1.04, 1], { duration: 0.45, ease: "easeOut" });
  };
  const poke = () => {
    stopAnims();
    animate(hop, [0, -26, 0], { duration: 0.4, ease: "easeOut" });
    animate(squash, [1, 0.9, 1.05, 1], { duration: 0.5 });
    say(PHRASES[Math.floor(rand(0, PHRASES.length))]);
  };

  return (
    <motion.div
      className="pet-root"
      style={{ x, y, width: size, height: size }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={bounds}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-hidden="true"
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.id}
            className="pet-bubble"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            {bubble.text}
          </motion.div>
        )}
      </AnimatePresence>

      {asleep && (
        <div className="pet-zzz">
          <span>z</span>
          <span>z</span>
          <span>Z</span>
        </div>
      )}

      <motion.div className="pet-hop" style={{ y: hop, scaleY: hopScaleY, scaleX: hopScaleX }}>
        <motion.div
          className="pet-head"
          style={{ rotateX: rotX, rotateY: rotY, rotateZ: rotZ, y: headY }}
        >
          <img className="pet-layer" src={IMG.body} alt="" draggable={false} />
          <motion.img
            className="pet-layer"
            src={IMG.left}
            alt=""
            draggable={false}
            style={{ rotate: antL, transformOrigin: PIVOT_L }}
          />
          <motion.img
            className="pet-layer"
            src={IMG.right}
            alt=""
            draggable={false}
            style={{ rotate: antR, transformOrigin: PIVOT_R }}
          />
        </motion.div>
      </motion.div>

      {/* área clicável/arrastável só sobre o bicho (o resto do quadrado deixa o clique passar) */}
      <motion.div
        className="pet-hit"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={(e) => controls.start(e)}
        onTap={poke}
      />
    </motion.div>
  );
}
