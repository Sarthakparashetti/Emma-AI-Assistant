import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPalette from "../CommandPalette";

import DashboardPage from "../../pages/DashboardPage";
import ChatPage from "../../pages/ChatPage";
import AutomationPage from "../../pages/AutomationPage";
import SecurityPage from "../../pages/SecurityPage";
import SettingsPage from "../../pages/SettingsPage";

import type { PageId } from "../../types/nav";

interface SystemStats {
  cpu: number;
  ram: number;
  battery: number;
  disk: number;
}

export interface SystemSample extends SystemStats {
  time: string;
}

const HISTORY_LIMIT = 24;

const PAGE_META: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "System overview and quick actions",
  },
  chat: {
    title: "Chat",
    subtitle: "Talk to Emma by voice or text",
  },
  automation: {
    title: "Automation",
    subtitle: "Multi-step commands and quick actions",
  },
  security: {
    title: "Security",
    subtitle: "Threat monitoring and system risk",
  },
  settings: {
    title: "Settings",
    subtitle: "Preferences and appearance",
  },
};

function AppShell() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [system, setSystem] = useState<SystemStats>({
    cpu: 0,
    ram: 0,
    battery: 0,
    disk: 0,
  });

  const [history, setHistory] = useState<SystemSample[]>([]);

  const loadSystem = useCallback(async () => {
    try {
      const res = await api.get("/system");
      setSystem(res.data);

      const sample: SystemSample = {
        ...res.data,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setHistory((prev) => [...prev, sample].slice(-HISTORY_LIMIT));
    } catch (error) {
      console.error("Failed to fetch system information:", error);
    }
  }, []);

  useEffect(() => {
    loadSystem();

    const timer = setInterval(loadSystem, 3000);

    return () => clearInterval(timer);
  }, [loadSystem]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        active={page}
        onNavigate={setPage}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          onToggleMobileSidebar={() => setMobileOpen((prev) => !prev)}
          onOpenPalette={() => setPaletteOpen(true)}
          systemHealth={Math.max(system.cpu, system.ram)}
          pageTitle={PAGE_META[page].title}
          pageSubtitle={PAGE_META[page].subtitle}
        />

        <main className="flex-1 p-4">
          {page === "dashboard" && (
            <DashboardPage system={system} history={history} onNavigate={setPage} />
          )}
          {page === "chat" && <ChatPage />}
          {page === "automation" && <AutomationPage />}
          {page === "security" && <SecurityPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={setPage}
      />
    </div>
  );
}

export default AppShell;
