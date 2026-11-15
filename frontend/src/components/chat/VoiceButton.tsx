import { AnimatePresence, motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useAssistant } from "../../context/AssistantContext";

const BAR_COUNT = 4;

function VoiceButton() {
  const { listening, loading, startListening, stopListening } =
    useAssistant();

  function handleClick() {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  const state: "listening" | "processing" | "idle" = listening
    ? "listening"
    : loading
    ? "processing"
    : "idle";

  const stateColor =
    state === "listening"
      ? "var(--accent-aqua)"
      : state === "processing"
      ? "var(--accent-blue)"
      : "var(--accent-cyan)";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      aria-pressed={listening}
      title={listening ? "Stop listening" : "Speak to Emma"}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2"
      style={{ ["--tw-ring-color" as string]: stateColor }}
    >
      <AnimatePresence>
        {state === "listening" &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: `1.5px solid ${stateColor}` }}
              initial={{ opacity: 0.6, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.7 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.55,
                ease: "easeOut",
              }}
            />
          ))}
      </AnimatePresence>

      {state === "processing" && (
        <motion.span
          className="absolute inset-[-3px] rounded-full"
          style={{
            border: `2px solid transparent`,
            borderTopColor: stateColor,
            borderRightColor: stateColor,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      )}

      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background: "var(--bg-panel-raised)",
          border: "1px solid var(--border-glass)",
        }}
        animate={
          state === "idle"
            ? {
                boxShadow: [
                  "0 0 10px rgba(0,229,196,0.25)",
                  "0 0 20px rgba(0,229,196,0.45)",
                  "0 0 10px rgba(0,229,196,0.25)",
                ],
              }
            : { boxShadow: `var(--glow-cyan)` }
        }
        transition={
          state === "idle"
            ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />

      <span className="relative flex items-center justify-center">
        {state === "listening" ? (
          <span className="flex h-4 items-center gap-[3px]">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full"
                style={{ background: stateColor, height: "100%" }}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        ) : (
          <Mic size={17} color={stateColor} strokeWidth={2.2} />
        )}
      </span>
    </button>
  );
}

export default VoiceButton;
