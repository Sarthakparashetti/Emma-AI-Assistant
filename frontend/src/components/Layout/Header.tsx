import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Activity, Bell, UserCircle2, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenPalette: () => void;
  systemHealth?: number;
  pageTitle: string;
  pageSubtitle: string;
}

function Header({
  onToggleMobileSidebar,
  onOpenPalette,
  systemHealth,
  pageTitle,
  pageSubtitle,
}: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const health = systemHealth ?? 0;
  const healthLabel = health < 50 ? "Optimal" : health < 80 ? "Stable" : "High Load";

  return (
    <header className="glass-panel m-3 mb-0 flex flex-wrap items-center gap-3 px-4 py-3">
      <button
        onClick={onToggleMobileSidebar}
        className="control-glass flex h-10 w-10 shrink-0 items-center justify-center md:hidden"
        aria-label="Toggle navigation"
      >
        <Menu size={18} />
      </button>

      {/* Prominent search / command bar */}
      <button
        onClick={onOpenPalette}
        className="control-glass flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <Search size={16} style={{ color: "var(--accent-cyan)" }} />
        <span className="flex-1 truncate">Search or type a command...</span>
        <span
          className="hidden shrink-0 rounded border px-1.5 py-0.5 text-[10px] sm:block"
          style={{ borderColor: "var(--border-glass)", color: "var(--text-muted)" }}
        >
          Ctrl K
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-2">
        {/* Assistant status */}
        <div className="control-glass hidden items-center gap-2 px-3 py-2 text-xs font-medium md:flex">
          <motion.span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--accent-aqua)" }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="leading-tight">
            <div style={{ color: "var(--text-secondary)" }}>Assistant Online</div>
          </div>
        </div>

        {/* System health */}
        <div className="control-glass hidden items-center gap-2 px-3 py-2 text-xs font-medium lg:flex" title="System health">
          <Activity size={14} style={{ color: "var(--accent-cyan)" }} />
          <span style={{ color: "var(--text-secondary)" }}>{healthLabel}</span>
        </div>

        {/* Date + time */}
        <div className="control-glass hidden px-3 py-2 text-xs font-medium tabular-nums xl:block">
          <div style={{ color: "var(--text-secondary)" }}>
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>

        <button className="control-glass relative flex h-10 w-10 items-center justify-center" aria-label="Notifications">
          <Bell size={17} style={{ color: "var(--text-secondary)" }} />
        </button>

        <ThemeToggle />

        <button className="control-glass flex h-10 w-10 items-center justify-center" aria-label="User profile" title="User profile">
          <UserCircle2 size={20} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      {/* Compact page context (visible on small screens where the page's own hero may be less prominent) */}
      <div className="w-full md:hidden">
        <h2 className="font-heading text-sm font-semibold">{pageTitle}</h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{pageSubtitle}</p>
      </div>
    </header>
  );
}

export default Header;
