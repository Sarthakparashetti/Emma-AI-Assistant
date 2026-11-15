import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ScanLine,
  Loader2,
  Cpu,
  Network,
  KeyRound,
  Link2,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api";
import { analyzePassword } from "../utils/passwordStrength";

interface ScoreData {
  score: number;
  threat_level: string;
  breakdown: string[];
  flagged_processes: number;
  established_connections: number;
  vision_note: string | null;
}

interface ProcessEntry {
  pid: number;
  name: string;
  exe: string;
  cpu_percent: number;
  memory_percent: number;
  flags: string[];
  risk: string;
}

interface ConnectionEntry {
  pid: number | null;
  process: string;
  local_address: string | null;
  remote_address: string;
}

function SecurityPage() {
  const [score, setScore] = useState<ScoreData | null>(null);
  const [processes, setProcesses] = useState<ProcessEntry[]>([]);
  const [connections, setConnections] = useState<ConnectionEntry[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [scanReport, setScanReport] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const passwordAnalysis = analyzePassword(password);

  const [url, setUrl] = useState("");
  const [urlResult, setUrlResult] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    setLoadingOverview(true);

    try {
      const [scoreRes, procRes, netRes] = await Promise.all([
        api.get("/security/score"),
        api.get("/security/processes"),
        api.get("/security/network"),
      ]);

      setScore(scoreRes.data);
      setProcesses(procRes.data.processes ?? []);
      setConnections(netRes.data.connections ?? []);
    } catch (error) {
      console.error("Failed to load security overview:", error);
    } finally {
      setLoadingOverview(false);
    }
  }

  async function runScan() {
    setScanLoading(true);
    setScanError(null);

    try {
      const res = await api.get("/security/scan");

      if (res.data.status === "ok") {
        setScanReport(res.data.report);
      } else {
        setScanError(res.data.report ?? "Scan failed.");
      }
    } catch {
      setScanError("Could not reach the security scan service.");
    } finally {
      setScanLoading(false);
    }
  }

  async function checkUrl() {
    if (!url.trim()) return;

    setUrlLoading(true);
    setUrlResult(null);

    try {
      const res = await api.post("/security/url-check", { url });

      if (res.data.status === "ok") {
        setUrlResult(
          `${res.data.malicious} malicious, ${res.data.suspicious} suspicious, ${res.data.harmless} harmless (VirusTotal community results)`
        );
      } else {
        setUrlResult(res.data.message ?? "Could not check this URL.");
      }
    } catch {
      setUrlResult("Could not reach the URL reputation service.");
    } finally {
      setUrlLoading(false);
    }
  }

  const threatColor =
    score?.threat_level === "Low"
      ? "var(--accent-cyan)"
      : score?.threat_level === "Moderate"
      ? "var(--accent-blue)"
      : "var(--danger)";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Security</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Threat monitoring and system risk.
        </p>
      </div>

      {/* Score + breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div className="glass-panel p-6 lg:col-span-1">
          <h3 className="font-heading text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Security Score
          </h3>

          {loadingOverview ? (
            <Loader2 className="mt-6 animate-spin" size={20} style={{ color: "var(--accent-cyan)" }} />
          ) : (
            <>
              <p className="mt-2 font-display text-5xl font-bold" style={{ color: threatColor }}>
                {score?.score ?? "--"}
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: threatColor }}>
                {score?.threat_level ?? "Unknown"} threat level
              </p>
            </>
          )}
        </motion.div>

        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="font-heading text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Risk Breakdown
          </h3>

          <ul className="mt-3 space-y-2 text-sm">
            {(score?.breakdown ?? []).map((line, i) => (
              <li key={i} className="flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent-blue)" }} />
                {line}
              </li>
            ))}
          </ul>

          {score?.vision_note && (
            <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
              {score.vision_note}
            </p>
          )}
        </div>
      </div>

      {/* Screen / phishing scan */}
      <motion.div whileHover={{ y: -2 }} className="glass-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} style={{ color: "var(--accent-cyan)" }} />
            <h3 className="font-heading text-base font-semibold">Screen Content Scan</h3>
          </div>

          <button
            onClick={runScan}
            disabled={scanLoading}
            className="btn-neon flex items-center gap-2 px-3 py-1.5 text-xs"
          >
            {scanLoading ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
            Scan current screen
          </button>
        </div>

        <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          Analyzes the most recent screenshot for phishing pages, scam
          indicators and other cyber threats. This is one signal among
          several on this page — not a full system security picture on
          its own.
        </p>

        {scanError && (
          <p className="mt-3 text-xs" style={{ color: "var(--danger)" }}>{scanError}</p>
        )}

        {scanReport && (
          <pre
            className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl p-4 text-xs"
            style={{
              background: "var(--bg-panel-raised)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-secondary)",
            }}
          >
            {scanReport}
          </pre>
        )}
      </motion.div>

      {/* Processes + Network */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2">
            <Cpu size={18} style={{ color: "var(--accent-cyan)" }} />
            <h3 className="font-heading text-base font-semibold">Running Processes</h3>
            {score && (
              <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
                {score.flagged_processes} flagged
              </span>
            )}
          </div>

          <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {processes.slice(0, 25).map((p) => (
              <div
                key={p.pid}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                style={{
                  background: p.flags.length ? "rgba(255,84,112,0.08)" : "var(--bg-panel-raised)",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }} className="truncate">
                  {p.name} <span style={{ color: "var(--text-muted)" }}>#{p.pid}</span>
                </span>
                <span
                  style={{ color: p.flags.length ? "var(--danger)" : "var(--text-muted)" }}
                  className="ml-2 shrink-0"
                >
                  {p.flags.length ? p.flags.join(", ") : `${p.cpu_percent}% CPU`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center gap-2">
            <Network size={18} style={{ color: "var(--accent-cyan)" }} />
            <h3 className="font-heading text-base font-semibold">Active Connections</h3>
          </div>

          <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {connections.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No established outbound connections detected (or elevated
                privileges are required to read them on this OS).
              </p>
            ) : (
              connections.slice(0, 25).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                  style={{ background: "var(--bg-panel-raised)" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{c.process}</span>
                  <span style={{ color: "var(--text-muted)" }}>{c.remote_address}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Password strength + URL reputation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2">
            <KeyRound size={18} style={{ color: "var(--accent-cyan)" }} />
            <h3 className="font-heading text-base font-semibold">Password Strength Audit</h3>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to analyze (nothing is sent anywhere)"
            className="control-glass mt-3 w-full px-4 py-2.5 text-sm outline-none"
          />

          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--bg-panel-raised)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${passwordAnalysis.score}%`,
                background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))",
              }}
            />
          </div>

          <p className="mt-2 text-xs font-medium" style={{ color: "var(--accent-cyan)" }}>
            {passwordAnalysis.label}
          </p>

          <ul className="mt-2 space-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
            {passwordAnalysis.feedback.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center gap-2">
            <Link2 size={18} style={{ color: "var(--accent-cyan)" }} />
            <h3 className="font-heading text-base font-semibold">URL Reputation Check</h3>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="control-glass flex-1 px-4 py-2.5 text-sm outline-none"
            />

            <button
              onClick={checkUrl}
              disabled={urlLoading}
              className="btn-neon px-4 py-2.5 text-sm"
            >
              {urlLoading ? <Loader2 size={16} className="animate-spin" /> : "Check"}
            </button>
          </div>

          {urlResult && (
            <p className="mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
              {urlResult}
            </p>
          )}

          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Powered by VirusTotal. Requires your own free API key — see
            SECURITY_SETUP.md.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
