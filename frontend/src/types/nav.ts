export type PageId =
  | "dashboard"
  | "chat"
  | "automation"
  | "security"
  | "settings";

export interface NavItem {
  id: PageId;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "chat", label: "Chat" },
  { id: "automation", label: "Automation" },
  { id: "security", label: "Security" },
  { id: "settings", label: "Settings" },
];
