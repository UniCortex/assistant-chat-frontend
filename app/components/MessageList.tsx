import { useEffect, useRef } from "react";
import { Message } from "@/types";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";

interface MessageListProps {
  messages: Message[];
  isBotTyping: boolean;
}

export default function MessageList({ messages, isBotTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  return (
    <div className="message-list" role="log" aria-live="polite" aria-label="Сообщения чата">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isBotTyping && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
