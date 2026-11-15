import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="control-glass relative flex h-9 w-16 items-center rounded-full px-1"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{
          background:
            "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
          boxShadow: "var(--glow-cyan-soft)",
          marginLeft: isDark ? 0 : "auto",
        }}
      >
        {isDark ? (
          <Moon size={14} color="#04120f" strokeWidth={2.5} />
        ) : (
          <Sun size={14} color="#04120f" strokeWidth={2.5} />
        )}
      </motion.div>
    </button>
  );
}

export default ThemeToggle;
