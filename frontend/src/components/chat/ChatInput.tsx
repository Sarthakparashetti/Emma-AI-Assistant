import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import VoiceButton from "./VoiceButton";
import { useAssistant } from "../../context/AssistantContext";

function ChatInput() {
  const { message, setMessage, sendMessage } = useAssistant();

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="control-glass relative flex items-end gap-2 p-2 pl-4">
      <textarea
        rows={2}
        value={message}
        placeholder="Ask Emma anything..."
        className="w-full resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-[color:var(--text-muted)]"
        style={{ color: "var(--text-primary)" }}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex items-center gap-2 pb-1">
        <VoiceButton />

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => sendMessage()}
          disabled={!message.trim()}
          className="btn-neon flex h-11 w-11 shrink-0 items-center justify-center"
          aria-label="Send message"
        >
          <SendHorizontal size={18} />
        </motion.button>
      </div>
    </div>
  );
}

export default ChatInput;
