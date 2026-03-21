export type BotState = "idle" | "thinking" | "eureka";

export interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}
