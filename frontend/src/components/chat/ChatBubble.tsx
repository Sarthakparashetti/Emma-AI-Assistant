import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

interface Message {
  sender: "user" | "emma";
  text: string;
  time: string;
}

interface ChatBubbleProps {
  message: Message;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === "user";
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-5 ${isUser ? "" : "glass-panel"}`}
        style={
          isUser
            ? {
                background:
                  "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
                color: "#04120f",
                boxShadow: "var(--glow-cyan-soft)",
              }
            : { color: "var(--text-primary)" }
        }
      >
        <div
          className="mb-3 text-xs font-medium opacity-70"
          style={!isUser ? { color: "var(--text-muted)" } : undefined}
        >
          {isUser ? "You" : "Emma"} • {message.time}
        </div>

        {isUser ? (
          <div className="whitespace-pre-wrap text-sm">
            {message.text}
          </div>
        ) : (
          <div className={`prose ${theme === "dark" ? "prose-invert" : ""} max-w-none text-sm`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ChatBubble;
