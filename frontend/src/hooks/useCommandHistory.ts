import { useMemo } from "react";
import { useAssistant } from "../context/AssistantContext";

export function useCommandHistory(limit = 12) {
  const { sessions } = useAssistant();

  return useMemo(() => {
    return sessions
      .flatMap((s) => s.messages)
      .filter((m) => m.sender === "user")
      .slice(-limit)
      .reverse();
  }, [sessions, limit]);
}
