import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Activity, Zap, Bot, ListChecks, History,
  ChevronRight, Cpu, MemoryStick, HardDrive, BatteryMedium,
} from "lucide-react";

import ChatBox from "../components/chat/ChatBox";
import ChatInput from "../components/chat/ChatInput";
import ChatBubble from "../components/chat/ChatBubble";
import NotesTasksPanel from "../components/Dashboard/NotesTasksPanel";
import AICore from "../components/assistant/AICore";
import api from "../services/api";
import { useAssistant } from "../context/AssistantContext";
import { useCommandHistory } from "../hooks/useCommandHistory";
import { QUICK_ACTIONS } from "../data/quickActions";
import type { PageId } from "../types/nav";
import type { SystemSample } from "../components/Layout/AppShell";

interface SystemStats {
  cpu: number;
  ram: number;
  battery: number;
  disk: number;
}

interface DashboardPageProps {
  system: SystemStats;
  history: SystemSample[];
  onNavigate: (page: PageId) => void;
}

interface ScoreData {
  score: number;
  threat_level: string;
  breakdown: string[];
}

interface Task {
  id: number;
  title: string;
  done: boolean;
  due_date: string | null;
}

const METRIC_OPTIONS: { key: keyof SystemStats; label: string }[] = [
  { key: "cpu", label: "CPU" },
  { key: "ram", label: "RAM" },
  { key: "disk", label: "Disk" },
];

const WELCOME_MESSAGE = {
  sender: "emma" as const,
  text: "Hello! I'm Emma, your AI assistant. Ask me anything or give me a command to control your system.",
  time: "",
};

function DashboardPage({ system, history, onNavigate }: DashboardPageProps) {
  const { currentSession, createNewChat, sendMessage, loading } = useAssistant();
  const commandHistory = useCommandHistory(5);
  const notesTasksRef = useRef<HTMLDivElement>(null);

  const [security, setSecurity] = useState<ScoreData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metric, setMetric] = useState<keyof SystemStats>("cpu");

  const loadSecurity = useCallback(async () => {
    try {
      const res = await api.get("/security/score");
      setSecurity(res.data);
    } catch (error) {
      console.error("Failed to load security score:", error);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }, []);

  useEffect(() => {
    loadSecurity();
    loadTasks();

    const timer = setInterval(loadSecurity, 30000);
    return () => clearInterval(timer);
  }, [loadSecurity, loadTasks]);

  const pendingTasks = useMemo(() => tasks.filter((t) => !t.done).slice(0, 4), [tasks]);
  const productivity = tasks.length
    ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
    : 0;

  const overallLoad = Math.round((system.cpu + system.ram) / 2);
  const healthLabel =
    overallLoad < 50 ? "Excellent" : overallLoad < 75 ? "Good" : overallLoad < 90 ? "Fair" : "High Load";

  const threatColor =
    security?.threat_level === "Low"
      ? "var(--accent-cyan)"
      : security?.threat_level === "Moderate"
      ? "var(--accent-blue)"
      : "var(--danger)";

  function scrollToTasks() {
    notesTasksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_320px]">
        {/* Left column: hero, stats, chat + quick actions */}
        <div className="space-y-4">
          {/* Hero + stats merged into one banner — uses the space freed by moving the AI core to the sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel p-5"
          >
            <h1 className="font-display text-xl font-bold sm:text-2xl">Welcome back</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Your AI assistant is monitoring your system and keeping you protected.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile icon={Activity} label="System Health" value={healthLabel} sub="All systems tracked live" accent="var(--accent-cyan)" />
              <StatTile
                icon={ShieldCheck}
                label="Security Score"
                value={security ? `${security.score}%` : "--"}
                sub={security ? `${security.threat_level} threat level` : "Loading..."}
                accent={threatColor}
              />
              <StatTile
                icon={Zap}
                label="Productivity"
                value={tasks.length ? `${productivity}%` : "No tasks yet"}
                sub={tasks.length ? `${tasks.filter((t) => t.done).length}/${tasks.length} tasks done` : "Add a task to track"}
                accent="var(--accent-blue)"
              />
              <StatTile icon={Bot} label="AI Assistant" value="Active" sub="Ready to assist" accent="var(--accent-aqua)" />
            </div>
          </motion.div>

          {/* Chat + Quick Actions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold">AI Chat</h3>
                <button
                  onClick={() => {
                    createNewChat();
                    onNavigate("chat");
                  }}
                  className="btn-neon px-3 py-1.5 text-xs"
                >
                  + New Chat
                </button>
              </div>

              <div className="mt-3">
                {currentSession ? (
                  <ChatBox />
                ) : (
                  <div className="space-y-3">
                    <ChatBubble message={WELCOME_MESSAGE} />
                    <ChatInput />
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-5">
              <h3 className="font-heading text-base font-semibold">Quick Actions</h3>

              <div className="mt-3 space-y-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.command}
                    disabled={loading}
                    onClick={() => sendMessage(action.command)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[var(--bg-panel-raised)] disabled:opacity-50"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "var(--bg-panel-raised)", border: "1px solid var(--border-glass)" }}
                    >
                      <action.icon size={15} style={{ color: "var(--accent-cyan)" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{action.label}</p>
                      <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{action.description}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Overview + Recent Activities + Security Overview — fills the space below AI Chat / Quick Actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold">System Overview</h3>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as keyof SystemStats)}
                  className="control-glass px-2 py-1 text-xs outline-none"
                >
                  {METRIC_OPTIONS.map((m) => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3 h-36">
                {history.length < 2 ? (
                  <div className="flex h-full items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                    Collecting live data...
                  </div>
                ) : (
                  <SystemLineChart data={history} metric={metric} />
                )}
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="flex items-center gap-2">
                <History size={15} style={{ color: "var(--accent-cyan)" }} />
                <h3 className="font-heading text-sm font-semibold">Recent Activities</h3>
                <button onClick={() => onNavigate("automation")} className="ml-auto text-xs" style={{ color: "var(--accent-cyan)" }}>
                  View All
                </button>
              </div>

              <div className="mt-3 space-y-1.5">
                {commandHistory.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>No activity yet — talk to Emma to get started.</p>
                ) : (
                  commandHistory.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--bg-panel-raised)" }}>
                      <p className="truncate" style={{ color: "var(--text-secondary)" }}>{entry.text}</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{entry.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel p-5 sm:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} style={{ color: "var(--accent-cyan)" }} />
                <h3 className="font-heading text-sm font-semibold">Security Overview</h3>
                <button onClick={() => onNavigate("security")} className="ml-auto text-xs" style={{ color: "var(--accent-cyan)" }}>
                  View All
                </button>
              </div>

              {security ? (
                <>
                  <p className="mt-2 font-display text-2xl font-bold" style={{ color: threatColor }}>{security.score}</p>
                  <p className="text-xs font-medium" style={{ color: threatColor }}>{security.threat_level} threat level</p>

                  <ul className="mt-2 space-y-1 text-xs">
                    {security.breakdown.slice(0, 3).map((line, i) => (
                      <li key={i} style={{ color: "var(--text-muted)" }}>• {line}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>Loading security data...</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Upcoming Tasks + compact System Monitoring + AI Core */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2">
              <ListChecks size={16} style={{ color: "var(--accent-cyan)" }} />
              <h3 className="font-heading text-sm font-semibold">Upcoming Tasks</h3>
              <button onClick={scrollToTasks} className="ml-auto text-xs" style={{ color: "var(--accent-cyan)" }}>
                View All
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              {pendingTasks.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nothing pending — add a task below.</p>
              ) : (
                pendingTasks.map((task) => (
                  <div key={task.id} className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--bg-panel-raised)" }}>
                    <p className="truncate font-medium" style={{ color: "var(--text-secondary)" }}>{task.title}</p>
                    {task.due_date && (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{task.due_date}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold">System Monitoring</h3>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--accent-cyan)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-cyan)" }} />
                Live
              </span>
            </div>

            <div className="mt-4 flex justify-center">
              <LoadDonut value={overallLoad} size={104} />
            </div>

            <div className="mt-4 space-y-2.5">
              <MetricBar icon={Cpu} label="CPU" value={system.cpu} />
              <MetricBar icon={MemoryStick} label="RAM" value={system.ram} />
              <MetricBar icon={HardDrive} label="Disk" value={system.disk} />
              <MetricBar icon={BatteryMedium} label="Battery" value={system.battery} />
            </div>
          </div>

          <div className="glass-panel flex flex-col items-center p-5">
            <h3 className="mb-3 self-start font-heading text-sm font-semibold">AI Core</h3>
            <AICore variant="hero" />
          </div>
        </div>
      </div>

      {/* Full Notes/Tasks manager */}
      <div ref={notesTasksRef}>
        <h2 className="mb-4 font-heading text-xl font-semibold">Productivity</h2>
        <NotesTasksPanel />
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon, label, value, sub, accent,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass-panel glass-panel-hover p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--bg-panel-raised)" }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
      <p className="mt-2.5 font-display text-xl font-bold" style={{ color: accent }}>{value}</p>
      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
    </motion.div>
  );
}

function MetricBar({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <Icon size={12} style={{ color: "var(--accent-cyan)" }} />
          {label}
        </span>
        <span style={{ color: "var(--text-muted)" }}>{value}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-panel-raised)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))" }}
        />
      </div>
    </div>
  );
}

function SystemLineChart({
  data,
  metric,
}: {
  data: SystemSample[];
  metric: keyof SystemStats;
}) {
  const width = 100;
  const height = 100;
  const padding = 6;

  const points = useMemo(() => {
    if (data.length === 0) return [];

    const step = (width - padding * 2) / Math.max(1, data.length - 1);

    return data.map((sample, i) => {
      const value = Math.max(0, Math.min(100, sample[metric]));
      const x = padding + i * step;
      const y = height - padding - (value / 100) * (height - padding * 2);
      return { x, y, value, time: sample.time };
    });
  }, [data, metric]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points.at(-1)?.x ?? 0},${height - padding} L${points[0]?.x ?? 0},${height - padding} Z`;

  const latest = points.at(-1);

  return (
    <div className="flex h-full w-full flex-col">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="min-h-0 flex-1 w-full">
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padding} x2={width - padding}
            y1={padding + f * (height - padding * 2)} y2={padding + f * (height - padding * 2)}
            stroke="var(--border-glass)" strokeWidth="0.4"
          />
        ))}

        <path d={areaPath} fill="url(#chart-fill)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--accent-cyan)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />

        {latest && <circle cx={latest.x} cy={latest.y} r="1.6" fill="var(--accent-cyan)" />}
      </svg>

      <div className="mt-1.5 flex shrink-0 items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span>{points[0]?.time}</span>
        <span className="font-medium" style={{ color: "var(--accent-cyan)" }}>
          {latest ? `${latest.value}%` : ""}
        </span>
        <span>{latest?.time}</span>
      </div>
    </div>
  );
}

function LoadDonut({ value, size = 128 }: { value: number; size?: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--bg-panel-raised)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke="var(--accent-cyan)" strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-bold text-neon">{value}%</span>
        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Overall Load</span>
      </div>
    </div>
  );
}

export default DashboardPage;
