import ChatLayout from "../components/chat/ChatLayout";

function ChatPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Chat</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Talk to Emma by voice or text.
      </p>

      <ChatLayout />
    </div>
  );
}

export default ChatPage;
