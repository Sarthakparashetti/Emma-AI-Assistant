import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { useAssistant } from "../../context/AssistantContext";

interface AICoreProps {
  variant?: "hero" | "floating" | "sidebar";
  onExpand?: () => void;
  compact?: boolean;
}

type VisualState = "idle" | "listening" | "thinking" | "speaking";

const STATE_COPY: Record<VisualState, string> = {
  idle: "Standing by",
  listening: "Listening",
  thinking: "Processing",
  speaking: "Responding",
};

interface Particle {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  duration: number;
  delay: number;
}

function makeParticles(count: number, maxRadius: number, seedOffset: number): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random spread so it doesn't reshuffle on re-render
    const seed = i * 12.9898 + seedOffset;
    const rand1 = Math.abs(Math.sin(seed) * 43758.5453) % 1;
    const rand2 = Math.abs(Math.sin(seed * 1.7) * 12543.231) % 1;
    const rand3 = Math.abs(Math.sin(seed * 2.3) * 91231.7) % 1;
    const rand4 = Math.abs(Math.sin(seed * 3.1) * 5321.9) % 1;

    const angle = rand1 * Math.PI * 2;
    // sqrt bias keeps particles from clumping at the exact center
    const radius = Math.sqrt(rand2) * maxRadius;

    particles.push({
      x: 100 + Math.cos(angle) * radius,
      y: 100 + Math.sin(angle) * radius,
      r: 0.5 + rand3 * 1.6,
      baseOpacity: 0.15 + rand4 * 0.65,
      duration: 1.8 + rand3 * 2.4,
      delay: rand4 * 3,
    });
  }

  return particles;
}

function AICore({ variant = "hero", onExpand, compact = false }: AICoreProps) {
  const {
    assistantState,
    currentSession,
    listening,
    loading,
    startListening,
    stopListening,
  } = useAssistant();

  const size = variant === "hero" ? 236 : compact ? 40 : 62;
  const particleCount = variant === "hero" ? 60 : 26;

  const dust = useMemo(() => makeParticles(particleCount, 47, 1), [particleCount]);
  const sparkle = useMemo(
    () => makeParticles(Math.round(particleCount / 5), 44, 91),
    [particleCount]
  );

  // Purely visual "speaking" flourish: briefly shown right after Emma
  // finishes a reply. No context/backend change — derived locally.
  const [justSpoke, setJustSpoke] = useState(false);
  const wasLoadingRef = useRef(loading);

  useEffect(() => {
    const wasLoading = wasLoadingRef.current;
    wasLoadingRef.current = loading;

    if (wasLoading && !loading && currentSession?.messages.at(-1)?.sender === "emma") {
      setJustSpoke(true);
      const timer = setTimeout(() => setJustSpoke(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [loading, currentSession]);

  const visualState: VisualState = listening
    ? "listening"
    : justSpoke
    ? "speaking"
    : assistantState === "thinking"
    ? "thinking"
    : "idle";

  const accent =
    visualState === "listening"
      ? "var(--accent-aqua)"
      : visualState === "thinking"
      ? "var(--accent-blue)"
      : visualState === "speaking"
      ? "var(--accent-aqua)"
      : "var(--accent-cyan)";

  const lastMessage = currentSession?.messages.at(-1);
  const uid = variant;

  function handleClick() {
    if (variant === "floating" || variant === "sidebar") {
      onExpand?.();
      return;
    }

    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  const ringSpin = visualState === "thinking" ? 3 : visualState === "idle" ? 22 : 10;
  const particleSpin = visualState === "idle" ? 34 : visualState === "thinking" ? 7 : 16;

  return (
    <div
      className={
        variant === "floating"
          ? "fixed bottom-6 left-6 z-40 flex flex-col items-center"
          : "flex flex-col items-center"
      }
    >
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Emma AI core — click to talk"
        title={variant === "hero" ? (listening ? "Stop listening" : "Talk to Emma") : "Open Emma"}
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          filter: "drop-shadow(0 12px 34px rgba(0,0,0,0.5))",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <radialGradient id={`ambient-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
              <stop offset="60%" stopColor={accent} stopOpacity="0.12" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>

            {/* Deep glass sphere — bright core fading to a dark vignette edge */}
            <radialGradient id={`sphere-${uid}`} cx="42%" cy="38%" r="65%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="35%" stopColor="var(--bg-panel-raised)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
            </radialGradient>

            <radialGradient id={`sheen-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            <filter id={`soft-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>

            <clipPath id={`clip-${uid}`}>
              <circle cx="100" cy="100" r="53" />
            </clipPath>
          </defs>

          {/* Ambient outer glow */}
          <circle cx="100" cy="100" r="98" fill={`url(#ambient-${uid})`} />

          {/* Concentric depth rings (static, layered like a HUD readout) */}
          {[64, 74, 84, 94].map((r, i) => (
            <circle
              key={r}
              cx="100" cy="100" r={r}
              fill="none"
              stroke={accent}
              strokeOpacity={0.22 - i * 0.035}
              strokeWidth={0.75}
            />
          ))}

          {/* Rotating dashed energy ring */}
          <g style={{ transformOrigin: "100px 100px", animation: `os-rotate ${ringSpin}s linear infinite` }}>
            <circle
              cx="100" cy="100" r="88"
              fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="1.25"
              strokeDasharray="1 9"
            />
          </g>
          <g style={{ transformOrigin: "100px 100px", animation: `os-rotate ${ringSpin * 1.6}s linear infinite reverse` }}>
            <circle
              cx="100" cy="100" r="70"
              fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1"
              strokeDasharray="6 14"
            />
          </g>

          {/* Sound-wave ripples while listening or speaking */}
          {(visualState === "listening" || visualState === "speaking") &&
            [0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={100} cy={100} r={56}
                fill="none" stroke={accent} strokeWidth={1.2}
                initial={{ opacity: 0.55, scale: 0.85 }}
                animate={{ opacity: 0, scale: 1.7 }}
                transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.55, ease: "easeOut" }}
                style={{ transformOrigin: "100px 100px" }}
              />
            ))}

          {/* Glass sphere core */}
          <motion.circle
            cx="100" cy="100" r="53"
            fill={`url(#sphere-${uid})`}
            stroke={accent}
            strokeWidth="1.5"
            strokeOpacity="0.8"
            animate={visualState === "idle" ? { r: [51, 54, 51] } : { r: 53 }}
            transition={{
              duration: 3, repeat: visualState === "idle" ? Infinity : 0, ease: "easeInOut",
            }}
          />

          {/* Dense particle field inside the sphere */}
          <g
            clipPath={`url(#clip-${uid})`}
            style={{ transformOrigin: "100px 100px", animation: `os-rotate ${particleSpin}s linear infinite` }}
          >
            {dust.map((p, i) => (
              <motion.circle
                key={`dust-${i}`}
                cx={p.x} cy={p.y} r={p.r}
                fill={accent}
                animate={{ opacity: [p.baseOpacity * 0.3, p.baseOpacity, p.baseOpacity * 0.3] }}
                transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
              />
            ))}

            {sparkle.map((p, i) => (
              <motion.circle
                key={`sparkle-${i}`}
                cx={p.x} cy={p.y} r={p.r + 0.6}
                fill="#ffffff"
                animate={{ opacity: [0, 0.85, 0] }}
                transition={{ duration: p.duration * 0.9, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
              />
            ))}
          </g>

          {/* Glass holographic sheen (top-left highlight) */}
          <ellipse
            cx="76" cy="72" rx="30" ry="20"
            fill={`url(#sheen-${uid})`}
            opacity="0.5"
            filter={`url(#soft-${uid})`}
          />

          {/* State-specific focal visualization */}
          {visualState === "listening" ? (
            <g>
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.rect
                  key={i}
                  x={100 - 20 + i * 10}
                  width={4}
                  rx={2}
                  fill={accent}
                  animate={{ height: [8, 28, 8], y: [96, 86, 96] }}
                  transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                />
              ))}
            </g>
          ) : visualState === "thinking" ? (
            <g style={{ transformOrigin: "100px 100px", animation: "os-rotate 1.2s linear infinite" }}>
              {Array.from({ length: 3 }).map((_, i) => {
                const angle = (i / 3) * 2 * Math.PI;
                const x = 100 + Math.cos(angle) * 20;
                const y = 100 + Math.sin(angle) * 20;
                return <circle key={i} cx={x} cy={y} r={3.2} fill={accent} />;
              })}
              <circle cx="100" cy="100" r="2.4" fill={accent} />
            </g>
          ) : visualState === "speaking" ? (
            <motion.circle
              cx="100" cy="100" r="14" fill="none" stroke={accent} strokeWidth={2.5}
              animate={{ r: [10, 17, 10], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <motion.circle
              cx="100" cy="100" r="9" fill={accent}
              animate={{ r: [7, 11, 7], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </svg>
      </motion.button>

      {variant === "floating" && (
        <div className="mt-2 flex flex-col items-center gap-1.5">
          <span
            className="glass-panel-strong rounded-full px-3 py-1 text-[11px] font-medium"
            style={{ color: accent }}
          >
            {STATE_COPY[visualState]}
          </span>

          <button
            onClick={onExpand}
            className="control-glass flex h-6 w-6 items-center justify-center rounded-full"
            aria-label="Expand assistant"
            title="Open full chat"
          >
            <Maximize2 size={11} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      )}

      {variant === "sidebar" && !compact && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold" style={{ color: accent }}>
            {STATE_COPY[visualState]}
          </span>

          <button
            onClick={onExpand}
            className="mt-0.5 text-[10px] underline-offset-2 hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Expand
          </button>
        </div>
      )}

      {variant === "hero" && (
        <div className="mt-5 text-center">
          <div className="font-heading text-sm font-semibold" style={{ color: accent }}>
            {STATE_COPY[visualState]}
          </div>
          <div
            className="mt-1 max-w-xs truncate text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {lastMessage ? lastMessage.text : "Click the core or use the mic to talk to Emma"}
          </div>
        </div>
      )}
    </div>
  );
}

export default AICore;
