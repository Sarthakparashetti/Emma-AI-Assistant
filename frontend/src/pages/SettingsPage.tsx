import { useEffect, useState } from "react";
import { Moon, Sun, Trash2, Info, CheckCircle2, XCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAssistant } from "../context/AssistantContext";

const REDUCED_MOTION_KEY = "emma-reduced-motion";

const MODULE_STATUS: { label: string; working: boolean; note: string }[] = [
  { label: "Voice recognition & text-to-speech", working: true, note: "Windows only, requires microphone" },
  { label: "Multi-step command planner", working: true, note: "Splits \"X and Y\" into separate steps" },
  { label: "Chat memory (SQLite)", working: true, note: "" },
  { label: "App launching, closing & window control", working: true, note: "Windows only — open/close/restart apps, list/activate/minimize/maximize windows" },
  { label: "Browser, file & media commands", working: true, note: "Open sites/search, create/move/delete files, media-key control" },
  { label: "Screenshot, OCR & vision queries", working: true, note: "Screen capture, text extraction, Gemini-Vision screen description" },
  { label: "Screen-based security scan", working: true, note: "Requires GEMINI_API_KEY" },
  { label: "Process & network monitoring", working: true, note: "" },
  { label: "URL reputation check", working: false, note: "Needs your own free VirusTotal API key — see SECURITY_SETUP.md" },
  { label: "Wake-word detection", working: false, note: "Falls back to checking if speech starts with \"emma\"" },
  { label: "Calendar integration", working: false, note: "Not implemented in this build" },
];

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { sessions, clearAllSessions } = useAssistant();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REDUCED_MOTION_KEY) === "true";
    setReducedMotion(saved);
    document.documentElement.classList.toggle("reduce-motion", saved);
  }, []);

  function handleReducedMotionToggle() {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem(REDUCED_MOTION_KEY, String(next));
    document.documentElement.classList.toggle("reduce-motion", next);
  }

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    clearAllSessions();
    setConfirmClear(false);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Preferences and appearance.
        </p>
      </div>

      {/* Appearance */}
      <div className="glass-panel p-5">
        <h3 className="font-heading text-base font-semibold">Appearance</h3>

        <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-panel-raised)" }}>
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon size={16} style={{ color: "var(--accent-cyan)" }} />
            ) : (
              <Sun size={16} style={{ color: "var(--accent-cyan)" }} />
            )}
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Currently {theme === "dark" ? "Dark" : "Light"} mode
              </p>
            </div>
          </div>

          <button onClick={toggleTheme} className="btn-neon px-4 py-2 text-xs">
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-panel-raised)" }}>
          <div>
            <p className="text-sm font-medium">Reduced motion</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Minimizes glow pulses and transitions
            </p>
          </div>

          <button
            onClick={handleReducedMotionToggle}
            className="control-glass px-4 py-2 text-xs"
            style={{ color: reducedMotion ? "var(--accent-cyan)" : "var(--text-secondary)" }}
          >
            {reducedMotion ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="glass-panel p-5">
        <h3 className="font-heading text-base font-semibold">Conversation Data</h3>

        <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-panel-raised)" }}>
          <div>
            <p className="text-sm font-medium">
              {sessions.length} chat session{sessions.length === 1 ? "" : "s"} stored locally
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              This clears the browser's local session list only — the
              backend's SQLite chat memory is separate and untouched.
            </p>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
            style={{
              background: confirmClear ? "var(--danger)" : "var(--bg-panel)",
              color: confirmClear ? "#1a0006" : "var(--danger)",
              border: "1px solid var(--danger)",
            }}
          >
            <Trash2 size={13} />
            {confirmClear ? "Confirm clear" : "Clear all"}
          </button>
        </div>
      </div>

      {/* Module status — honest, not marketing */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2">
          <Info size={18} style={{ color: "var(--accent-cyan)" }} />
          <h3 className="font-heading text-base font-semibold">Module Status</h3>
        </div>

        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          An honest read of what's implemented in this build versus what
          still needs work.
        </p>

        <div className="mt-3 space-y-2">
          {MODULE_STATUS.map((mod) => (
            <div
              key={mod.label}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: "var(--bg-panel-raised)" }}
            >
              {mod.working ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--accent-cyan)" }} />
              ) : (
                <XCircle size={16} className="mt-0.5 shrink-0" style={{ color: "var(--danger)" }} />
              )}

              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {mod.label}
                </p>
                {mod.note && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{mod.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
