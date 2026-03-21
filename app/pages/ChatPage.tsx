import { useState, useCallback } from "react";
import ChatLauncher from "@/components/ChatLauncher";
import ChatWindow from "@/components/ChatWindow";
import { Message, BotState } from "@/types";
import { getMockResponse } from "@/lib/mockData";

export default function ChatPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [botState, setBotState] = useState<BotState>("idle");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [usePrimeRaccoon, setUsePrimeRaccoon] = useState(false);

  const raccoonFallbackSrc = usePrimeRaccoon ? "/raccoon_prime.png" : "/raccoon.png";

  const openChat = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcome: Message = {
        id: "welcome",
        role: "bot",
        text: "Привет! Я помощник ЯрГУ. Задайте любой вопрос об университете — я постараюсь помочь.",
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [messages.length]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setBotState("thinking");
      setIsBotTyping(true);

      const delay = 1500 + Math.random() * 1000;

      await new Promise((resolve) => setTimeout(resolve, delay));

      const responseText = getMockResponse(text);

      setBotState("eureka");
      setIsBotTyping(false);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      setTimeout(() => {
        setBotState("idle");
      }, 2500);
    },
    []
  );

  return (
    <div className="chat-page">
      {!isOpen && (
        <ChatLauncher
          botState={botState}
          onOpen={openChat}
          fallbackImageSrc={raccoonFallbackSrc}
          onToggleEasterEggRaccoon={() => setUsePrimeRaccoon((v) => !v)}
        />
      )}
      <ChatWindow
        isOpen={isOpen}
        messages={messages}
        botState={botState}
        isBotTyping={isBotTyping}
        onClose={closeChat}
        onSend={sendMessage}
        fallbackImageSrc={raccoonFallbackSrc}
      />
    </div>
  );
}
