import { motion } from "framer-motion";
import { Terminal, History } from "lucide-react";
import { useAssistant } from "../context/AssistantContext";
import { useCommandHistory } from "../hooks/useCommandHistory";
import { QUICK_ACTIONS } from "../data/quickActions";

function AutomationPage() {
  const { sendMessage, loading } = useAssistant();
  const history = useCommandHistory(12);

  function runQuickAction(command: string) {
    sendMessage(command);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Automation</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Multi-step commands and quick actions.
        </p>
      </div>

      <div className="glass-panel p-5">
        <div className="flex items-center gap-2">
          <Terminal size={18} style={{ color: "var(--accent-cyan)" }} />
          <h3 className="font-heading text-base font-semibold">
            Multi-step commands
          </h3>
        </div>

        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Emma's planner splits a single request into multiple executable
          steps automatically. Try phrasing a command with "and" or "then" —
          for example:
        </p>

        <code
          className="mt-3 block rounded-xl p-4 text-sm"
          style={{
            background: "var(--bg-panel-raised)",
            border: "1px solid var(--border-glass)",
            color: "var(--accent-cyan)",
          }}
        >
          "open notepad and open calculator"
        </code>
      </div>

      {/* Quick actions — real commands sent through the existing /chat pipeline */}
      <div>
        <h3 className="mb-3 font-heading text-base font-semibold">Quick Actions</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <motion.button
              key={action.command}
              whileHover={{ y: -3 }}
              disabled={loading}
              onClick={() => runQuickAction(action.command)}
              className="glass-panel glass-panel-hover flex flex-col items-start gap-3 p-5 text-left disabled:opacity-50"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  background: "var(--bg-panel-raised)",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <action.icon size={18} style={{ color: "var(--accent-cyan)" }} />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Real command history, not mock data */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2">
          <History size={18} style={{ color: "var(--accent-cyan)" }} />
          <h3 className="font-heading text-base font-semibold">Recent Commands</h3>
        </div>

        <div className="mt-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No commands yet — try a quick action above or talk to Emma.
            </p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
                style={{ background: "var(--bg-panel-raised)" }}
              >
                <span style={{ color: "var(--text-secondary)" }}>{entry.text}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {entry.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AutomationPage;
