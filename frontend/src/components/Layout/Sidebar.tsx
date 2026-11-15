import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Shield,
  Settings,
  Wrench,
  ChevronsLeft,
  ChevronsRight,
  Bot,
  X,
} from "lucide-react";
import type { PageId } from "../../types/nav";
import { NAV_ITEMS } from "../../types/nav";

interface SidebarProps {
  active: PageId;
  onNavigate: (id: PageId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const ICONS: Record<PageId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  chat: MessageSquare,
  automation: Wrench,
  security: Shield,
  settings: Settings,
};

function SidebarContent({
  active,
  collapsed,
  onNavigate,
}: {
  active: PageId;
  collapsed: boolean;
  onNavigate: (id: PageId) => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="mb-8 flex shrink-0 items-center gap-3 px-1">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
            boxShadow: "var(--glow-cyan-soft)",
          }}
        >
          <Bot size={20} color="#04120f" strokeWidth={2.5} />
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-lg font-bold leading-none text-neon">
              EMMA
            </h1>
            <p
              className="mt-1 truncate text-[11px] tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              AI Operating System
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = ICONS[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors"
              style={{
                color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-panel-raised)" : "transparent",
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-glow"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    border: "1px solid var(--border-glass-strong)",
                    boxShadow: "var(--glow-cyan-soft)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              <Icon
                size={19}
                className="relative shrink-0 transition-transform group-hover:scale-110"
              />

              {!collapsed && (
                <span className="relative truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

function Sidebar({
  active,
  onNavigate,
  collapsed,
  onToggleCollapsed,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 260 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="glass-panel sticky top-3 z-20 m-3 mr-0 hidden shrink-0 flex-col self-start overflow-hidden p-4 md:flex"
        style={{ borderRadius: "var(--radius-panel)", height: "calc(100vh - 1.5rem)" }}
      >
        <SidebarContent active={active} collapsed={collapsed} onNavigate={onNavigate} />

        <button
          onClick={onToggleCollapsed}
          className="control-glass mt-4 flex shrink-0 items-center justify-center gap-2 py-2.5 text-xs font-medium hover:brightness-125"
          style={{ color: "var(--text-muted)" }}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-30 bg-black/60 md:hidden"
            />

            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="glass-panel-strong fixed inset-y-3 left-3 z-40 flex w-64 flex-col p-4 md:hidden"
              style={{ borderRadius: "var(--radius-panel)" }}
            >
              <button
                onClick={onCloseMobile}
                className="control-glass absolute right-3 top-3 flex h-8 w-8 items-center justify-center"
                aria-label="Close navigation"
              >
                <X size={15} />
              </button>

              <SidebarContent
                active={active}
                collapsed={false}
                onNavigate={(id) => {
                  onNavigate(id);
                  onCloseMobile?.();
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
