import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import api, { generateTitle } from "../services/api";
import useVoice from "../hooks/useVoice";
import type { ChatSession, Message } from "../types/chat";

const STORAGE_KEY = "emma-chat-sessions";
const CURRENT_CHAT_KEY = "emma-current-chat";

export type AssistantState = "idle" | "listening" | "thinking";

interface AssistantContextValue {
  sessions: ChatSession[];
  currentSessionId: string;
  currentSession: ChatSession | null;

  message: string;
  setMessage: (value: string) => void;

  loading: boolean;
  listening: boolean;
  assistantState: AssistantState;

  startListening: () => void;
  stopListening: () => void;

  selectSession: (id: string) => void;
  createNewChat: () => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  clearAllSessions: () => void;

  sendMessage: (customMessage?: string) => Promise<void>;
}

const AssistantContext = createContext<AssistantContextValue | undefined>(
  undefined
);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Load persisted chats ----
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const savedCurrent = localStorage.getItem(CURRENT_CHAT_KEY);

    if (savedSessions) {
      const parsed: ChatSession[] = JSON.parse(savedSessions);
      setSessions(parsed);

      if (savedCurrent) {
        setCurrentSessionId(savedCurrent);
      } else if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_CHAT_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) ?? null,
    [sessions, currentSessionId]
  );

  const createNewChat = useCallback(() => {
    const now = new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    setSessions((prev) => [...prev, session]);
    setCurrentSessionId(session.id);

    return session.id;
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      const remaining = sessions.filter((session) => session.id !== id);

      setSessions(remaining);

      if (currentSessionId === id) {
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else {
          setCurrentSessionId("");
          localStorage.removeItem(CURRENT_CHAT_KEY);
        }
      }
    },
    [sessions, currentSessionId]
  );

  const renameSession = useCallback((id: string, title: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, title, updatedAt: new Date().toLocaleString() }
          : session
      )
    );
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSessionId("");
    localStorage.removeItem(CURRENT_CHAT_KEY);
  }, []);

  const updateMessages = useCallback(
    (sessionId: string, messages: Message[]) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                title:
                  session.title === "New Chat" && messages.length > 0
                    ? messages[0].text.slice(0, 30)
                    : session.title,
                updatedAt: new Date().toLocaleString(),
                messages,
              }
            : session
        )
      );
    },
    []
  );

  const sendMessage = useCallback(
    async (customMessage?: string) => {
      const command = (customMessage ?? message).trim();

      if (!command) return;

      // Auto-create a session if the person speaks/types before starting one
      let sessionId = currentSessionId;
      let existingMessages: Message[] = currentSession?.messages ?? [];

      if (!sessionId) {
        sessionId = createNewChat();
        existingMessages = [];
      }

      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMessage: Message = {
        id: crypto.randomUUID(),
        sender: "user",
        text: command,
        time: now,
      };

      const updatedMessages = [...existingMessages, userMessage];

      updateMessages(sessionId, updatedMessages);
      setMessage("");
      setLoading(true);

      try {
        const res = await api.post("/chat", {
          chat_id: sessionId,
          message: command,
        });

        const emmaMessage: Message = {
          id: crypto.randomUUID(),
          sender: "emma",
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        updateMessages(sessionId, [...updatedMessages, emmaMessage]);

        // First exchange in this session — ask the backend for a real
        // generated title instead of just truncating the raw message.
        if (existingMessages.length === 0) {
          generateTitle(command, res.data.reply)
            .then((title: string) => {
              if (title) renameSession(sessionId, title);
            })
            .catch(() => {
              /* falls back to the truncated default title already set */
            });
        }
      } catch {
        updateMessages(sessionId, [
          ...updatedMessages,
          {
            id: crypto.randomUUID(),
            sender: "emma",
            text: "Backend Error",
            time: now,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [message, currentSessionId, currentSession, createNewChat, updateMessages, renameSession]
  );

  const handleVoiceResult = useCallback(
    (text: string) => {
      setMessage(text);
      setTimeout(() => sendMessage(text), 50);
    },
    [sendMessage]
  );

  const { listening, startListening, stopListening } =
    useVoice(handleVoiceResult);

  const assistantState: AssistantState = listening
    ? "listening"
    : loading
    ? "thinking"
    : "idle";

  const value: AssistantContextValue = {
    sessions,
    currentSessionId,
    currentSession,
    message,
    setMessage,
    loading,
    listening,
    assistantState,
    startListening,
    stopListening,
    selectSession: setCurrentSessionId,
    createNewChat,
    deleteSession,
    renameSession,
    clearAllSessions,
    sendMessage,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);

  if (!ctx) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }

  return ctx;
}
