import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useDragControls, useMotionValue } from "framer-motion";
import "./Pet.css";

/**
 * <DancingCats /> — três gatinhos que ficam parados e dançam quando você clica
 * (ou enquanto você arrasta). A dança é um WebP animado com fundo transparente,
 * feito a partir de um vídeo em chroma key.
 *
 * Arquivos em /public/pet/: cats-still.webp (quadro parado) e cats-dance.webp (animado).
 */

const BASE = import.meta.env.BASE_URL ?? "/";
const STILL = `${BASE}pet/cats-still.webp`;
const DANCE = `${BASE}pet/cats-dance.webp`;
const ASPECT = 382 / 340; // altura / largura da imagem

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function DancingCats({ size = 240, danceMs = 7000, margin = 24 }) {
  const height = Math.round(size * ASPECT);
  const controls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const squash = useMotionValue(1);

  const [dancing, setDancing] = useState(false);
  const [round, setRound] = useState(0); // muda a cada dança para reiniciar o WebP
  const [bubble, setBubble] = useState(null);
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const stopTimer = useRef();
  const held = useRef(false);

  // limites de arraste + posição inicial (canto inferior esquerdo)
  useEffect(() => {
    const calc = () => ({
      left: 0,
      top: 0,
      right: Math.max(0, window.innerWidth - size),
      bottom: Math.max(0, window.innerHeight - height),
    });
    const b = calc();
    setBounds(b);
    x.set(clamp(margin, 0, b.right));
    y.set(clamp(window.innerHeight - height - margin, 0, b.bottom));
    const onResize = () => {
      const nb = calc();
      setBounds(nb);
      x.set(clamp(x.get(), nb.left, nb.right));
      y.set(clamp(y.get(), nb.top, nb.bottom));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, height]);

  // pré-carrega o WebP animado para a dança começar sem atraso
  useEffect(() => {
    const img = new Image();
    img.src = DANCE;
  }, []);

  useEffect(() => () => clearTimeout(stopTimer.current), []);

  const startDance = (ms = danceMs) => {
    clearTimeout(stopTimer.current);
    setRound((r) => r + 1);
    setDancing(true);
    setBubble("🎶");
    stopTimer.current = setTimeout(() => {
      if (held.current) return startDance(1500); // ainda segurando: continua
      setDancing(false);
      setBubble(null);
    }, ms);
  };

  return (
    <motion.div
      className="pet-root"
      style={{ x, y, width: size, height }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={bounds}
      onDragStart={() => {
        held.current = true;
        animate(squash, 1.05, { type: "spring", stiffness: 300, damping: 12 });
        if (!dancing) startDance(2500);
      }}
      onDragEnd={() => {
        held.current = false;
        animate(squash, [0.94, 1.03, 1], { duration: 0.4, ease: "easeOut" });
      }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            className="pet-bubble"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="pet-hop" style={{ scale: squash }}>
        <img
          key={dancing ? `dance-${round}` : "still"}
          className="pet-layer"
          src={dancing ? DANCE : STILL}
          alt=""
          draggable={false}
        />
      </motion.div>

      <motion.div
        className="pet-hit"
        style={{ left: "4%", top: "6%", width: "92%", height: "90%", borderRadius: "24%", cursor: "grab" }}
        onPointerDown={(e) => controls.start(e)}
        onTap={() => startDance()}
      />
    </motion.div>
  );
}
