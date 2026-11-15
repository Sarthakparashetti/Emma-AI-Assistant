import { useEffect, useRef } from "react";

import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useAssistant } from "../../context/AssistantContext";

function ChatBox() {
  const { currentSession, loading } = useAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = currentSession?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div>
      <ChatInput />

      <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto rounded-xl pr-1">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div
              className="glass-panel flex items-center gap-2 px-5 py-3.5 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent-cyan)", animation: "os-bar-bounce 0.9s ease-in-out infinite" }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent-cyan)", animation: "os-bar-bounce 0.9s ease-in-out 0.15s infinite" }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent-cyan)", animation: "os-bar-bounce 0.9s ease-in-out 0.3s infinite" }}
              />
              <span className="ml-2">Emma is thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ChatBox;
