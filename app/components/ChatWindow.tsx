import { useEffect, useRef } from "react";
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { Message, BotState } from "@/types";

interface ChatWindowProps {
  isOpen: boolean;
  messages: Message[];
  botState: BotState;
  awaitingResponse: boolean;
  showTypingIndicator: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  fallbackImageSrc?: string;
}

export default function ChatWindow({
  isOpen,
  messages,
  botState,
  awaitingResponse,
  showTypingIndicator,
  onClose,
  onSend,
  fallbackImageSrc,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const focusable = containerRef.current.querySelector<HTMLElement>(
        "button, textarea, input"
      );
      focusable?.focus();
    }
  }, [isOpen]);

  return (
    <div
      className={`chat-overlay ${isOpen ? "chat-overlay--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`chat-window ${isOpen ? "chat-window--open" : ""}`}
        ref={containerRef}
        role="dialog"
        aria-label="Чат с помощником ЯрГУ"
        aria-modal="true"
      >
        <ChatHeader
          botState={botState}
          isBotTyping={awaitingResponse}
          onClose={onClose}
          fallbackImageSrc={fallbackImageSrc}
        />

        <MessageList messages={messages} isBotTyping={showTypingIndicator} />

        <ChatInput onSend={onSend} disabled={awaitingResponse} />
      </div>
    </div>
  );
}
