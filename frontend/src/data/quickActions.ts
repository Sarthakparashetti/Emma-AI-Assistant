import { Globe, FileText, Calculator, RefreshCw } from "lucide-react";

export interface QuickAction {
  label: string;
  description: string;
  command: string;
  icon: typeof Globe;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Open Applications", description: "Launch your favorite apps", command: "open chrome", icon: Globe },
  { label: "Open Notepad", description: "Quick notes on the fly", command: "open notepad", icon: FileText },
  { label: "Open Calculator", description: "Do a quick calculation", command: "open calculator", icon: Calculator },
  { label: "Refresh App Index", description: "Rescan installed apps", command: "refresh apps", icon: RefreshCw },
];
