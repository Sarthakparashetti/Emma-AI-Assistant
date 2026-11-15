import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, MessagesSquare } from "lucide-react";
import { useAssistant } from "../../context/AssistantContext";

function ChatSidebar() {
  const {
    sessions,
    currentSessionId,
    selectSession,
    createNewChat,
    deleteSession,
    renameSession,
  } = useAssistant();

  const [editingId, setEditingId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");

  function startEditing(id: string, currentTitle: string) {
    setEditingId(id);
    setEditingTitle(currentTitle);
  }

  function finishEditing() {
    if (editingId && editingTitle.trim()) {
      renameSession(editingId, editingTitle.trim());
    }

    setEditingId("");
    setEditingTitle("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      finishEditing();
    }

    if (e.key === "Escape") {
      setEditingId("");
      setEditingTitle("");
    }
  }

  return (
    <div className="glass-panel p-4">
      <button
        onClick={() => createNewChat()}
        className="btn-neon flex w-full items-center justify-center gap-2 py-3 text-sm"
      >
        <Plus size={16} />
        New Chat
      </button>

      <div className="mt-6 space-y-2">
        {sessions.length === 0 ? (
          <p className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <MessagesSquare size={15} />
            No conversations yet.
          </p>
        ) : (
          sessions.map((session) => {
            const isActive = currentSessionId === session.id;

            return (
              <motion.div
                key={session.id}
                whileHover={{ x: 2 }}
                className="group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                style={{
                  background: isActive ? "var(--bg-panel-raised)" : "transparent",
                  border: isActive
                    ? "1px solid var(--border-glass-strong)"
                    : "1px solid transparent",
                  boxShadow: isActive ? "var(--glow-cyan-soft)" : "none",
                }}
              >
                <div
                  className="flex-1 cursor-pointer overflow-hidden"
                  onClick={() => selectSession(session.id)}
                  onDoubleClick={() => startEditing(session.id, session.title)}
                >
                  {editingId === session.id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={handleKeyDown}
                      className="w-full rounded bg-transparent px-1 py-0.5 text-sm outline-none"
                      style={{ color: "var(--text-primary)" }}
                    />
                  ) : (
                    <div
                      className="truncate text-sm font-medium"
                      style={{
                        color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                      }}
                    >
                      {session.title}
                    </div>
                  )}

                  <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {session.createdAt}
                  </div>
                </div>

                <button
                  onClick={() => deleteSession(session.id)}
                  className="ml-2 rounded-lg p-1.5 opacity-0 transition hover:bg-[rgba(255,84,112,0.15)] group-hover:opacity-100"
                  title="Delete Chat"
                  aria-label="Delete Chat"
                >
                  <Trash2 size={14} style={{ color: "var(--danger)" }} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;
