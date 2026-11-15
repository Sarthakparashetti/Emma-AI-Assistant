import ChatSidebar from "./ChatSidebar";
import ChatBox from "./ChatBox";
import { useAssistant } from "../../context/AssistantContext";

function ChatLayout() {
  const { currentSession } = useAssistant();

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
      <ChatSidebar />

      {currentSession ? (
        <ChatBox />
      ) : (
        <div
          className="glass-panel flex items-center justify-center p-12 text-sm"
          style={{ borderStyle: "dashed", color: "var(--text-muted)" }}
        >
          Click{" "}
          <span className="mx-1 font-semibold text-neon">+ New Chat</span>{" "}
          to start a conversation.
        </div>
      )}
    </div>
  );
}

export default ChatLayout;
