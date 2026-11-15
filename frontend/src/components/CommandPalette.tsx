import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Wrench,
  Shield,
  Settings,
  Plus,
  Sun,
  Moon,
  ScanLine,
  Mic,
} from "lucide-react";
import type { PageId } from "../types/nav";
import { useTheme } from "../context/ThemeContext";
import { useAssistant } from "../context/AssistantContext";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: typeof LayoutDashboard;
  run: () => void;
}

function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { createNewChat, startListening } = useAssistant();

  const commands: Command[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        icon: LayoutDashboard,
        run: () => onNavigate("dashboard"),
      },
      {
        id: "nav-chat",
        label: "Go to Chat",
        icon: MessageSquare,
        run: () => onNavigate("chat"),
      },
      {
        id: "nav-automation",
        label: "Go to Automation",
        icon: Wrench,
        run: () => onNavigate("automation"),
      },
      {
        id: "nav-security",
        label: "Go to Security",
        icon: Shield,
        run: () => onNavigate("security"),
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        icon: Settings,
        run: () => onNavigate("settings"),
      },
      {
        id: "new-chat",
        label: "Start a new chat",
        icon: Plus,
        run: () => {
          createNewChat();
          onNavigate("chat");
        },
      },
      {
        id: "voice",
        label: "Talk to Emma",
        hint: "Voice input",
        icon: Mic,
        run: () => {
          onNavigate("chat");
          startListening();
        },
      },
      {
        id: "scan",
        label: "Run security scan",
        icon: ScanLine,
        run: () => onNavigate("security"),
      },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        icon: theme === "dark" ? Sun : Moon,
        run: toggleTheme,
      },
    ],
    [onNavigate, createNewChat, startListening, theme, toggleTheme]
  );

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function runCommand(cmd: Command) {
    cmd.run();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="glass-panel-strong fixed left-1/2 top-24 z-50 w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden p-0"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full border-b bg-transparent px-5 py-4 text-sm outline-none"
              style={{ borderColor: "var(--border-glass)", color: "var(--text-primary)" }}
            />

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No matching commands.
                </p>
              ) : (
                filtered.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => runCommand(cmd)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-panel-raised)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <cmd.icon size={16} style={{ color: "var(--accent-cyan)" }} />
                    <span>{cmd.label}</span>
                    {cmd.hint && (
                      <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
                        {cmd.hint}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
