export interface Message {
  id: string;
  sender: "user" | "emma";
  text: string;
  time: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}