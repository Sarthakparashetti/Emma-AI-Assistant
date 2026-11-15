import { useEffect, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { NotebookPen, ListChecks, Plus, Trash2, Loader2 } from "lucide-react";
import api from "../../services/api";

interface Note {
  id: number;
  title: string;
  content: string;
}

interface Task {
  id: number;
  title: string;
  done: boolean;
  due_date: string | null;
}

function NotesTasksPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [newNote, setNewNote] = useState("");
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    try {
      const [notesRes, tasksRes] = await Promise.all([
        api.get("/notes"),
        api.get("/tasks"),
      ]);

      setNotes(notesRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Failed to load notes/tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    const title = newNote.trim();
    if (!title) return;

    setNewNote("");

    const res = await api.post("/notes", { title, content: "" });
    setNotes((prev) => [res.data, ...prev]);
  }

  async function deleteNote(id: number) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await api.delete(`/notes/${id}`);
  }

  async function addTask() {
    const title = newTask.trim();
    if (!title) return;

    setNewTask("");

    const res = await api.post("/tasks", { title });
    setTasks((prev) => [res.data, ...prev]);
  }

  async function toggleTask(task: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
    );

    await api.patch(`/tasks/${task.id}`, { done: !task.done });
  }

  async function deleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.delete(`/tasks/${id}`);
  }

  function onNoteKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addNote();
  }

  function onTaskKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addTask();
  }

  if (loading) {
    return (
      <div className="glass-panel flex items-center justify-center p-10">
        <Loader2 className="animate-spin" size={20} style={{ color: "var(--accent-cyan)" }} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Tasks */}
      <motion.div whileHover={{ y: -2 }} className="glass-panel p-6">
        <div className="flex items-center gap-2">
          <ListChecks size={18} style={{ color: "var(--accent-cyan)" }} />
          <h3 className="font-heading text-base font-semibold">Tasks</h3>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={onTaskKeyDown}
            placeholder="Add a task..."
            className="control-glass flex-1 px-4 py-2 text-sm outline-none"
          />
          <button onClick={addTask} className="btn-neon flex h-9 w-9 shrink-0 items-center justify-center">
            <Plus size={16} />
          </button>
        </div>

        <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--bg-panel-raised)" }}
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task)}
                    className="shrink-0"
                  />
                  <span
                    className="truncate"
                    style={{
                      color: task.done ? "var(--text-muted)" : "var(--text-secondary)",
                      textDecoration: task.done ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </span>
                </label>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="ml-2 shrink-0 opacity-0 transition group-hover:opacity-100"
                  aria-label="Delete task"
                >
                  <Trash2 size={13} style={{ color: "var(--danger)" }} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Notes */}
      <motion.div whileHover={{ y: -2 }} className="glass-panel p-6">
        <div className="flex items-center gap-2">
          <NotebookPen size={18} style={{ color: "var(--accent-cyan)" }} />
          <h3 className="font-heading text-base font-semibold">Notes</h3>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={onNoteKeyDown}
            placeholder="Quick note..."
            className="control-glass flex-1 px-4 py-2 text-sm outline-none"
          />
          <button onClick={addNote} className="btn-neon flex h-9 w-9 shrink-0 items-center justify-center">
            <Plus size={16} />
          </button>
        </div>

        <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No notes yet.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                style={{ background: "var(--bg-panel-raised)" }}
              >
                <span className="truncate" style={{ color: "var(--text-secondary)" }}>
                  {note.title}
                </span>

                <button
                  onClick={() => deleteNote(note.id)}
                  className="ml-2 shrink-0 opacity-0 transition group-hover:opacity-100"
                  aria-label="Delete note"
                >
                  <Trash2 size={13} style={{ color: "var(--danger)" }} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default NotesTasksPanel;
