import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type StatusCardProps = {
  title: string;
  value: string;
  icon?: LucideIcon;
  percent?: number;
};

function StatusCard({ title, value, icon: Icon, percent }: StatusCardProps) {
  const clamped = Math.max(0, Math.min(100, percent ?? 0));

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass-panel glass-panel-hover p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {title}
        </h3>

        {Icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              background: "var(--bg-panel-raised)",
              border: "1px solid var(--border-glass)",
            }}
          >
            <Icon size={16} style={{ color: "var(--accent-cyan)" }} />
          </div>
        )}
      </div>

      <p className="mt-4 font-display text-3xl font-bold text-neon">
        {value}
      </p>

      {typeof percent === "number" && (
        <div
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: "var(--bg-panel-raised)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))",
              boxShadow: "var(--glow-cyan-soft)",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default StatusCard;
