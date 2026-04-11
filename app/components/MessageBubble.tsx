import { Message } from "@/types";
import BotChatAvatar from "@/components/BotChatAvatar";
import { formatAssistantReply } from "@/lib/chat/formatAssistantReply";

interface MessageBubbleProps {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row--user" : "message-row--bot"}`}>
      {!isUser && <BotChatAvatar />}

      <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--bot"}`}>
        {isUser ? (
          <p className="message-text">{message.text}</p>
        ) : (
          <div className="message-text message-text--bot">
            {formatAssistantReply(message.text) ?? message.text}
          </div>
        )}
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
