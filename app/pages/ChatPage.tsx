import { useState } from "react";
import ChatLauncher from "@/components/ChatLauncher";
import ChatWindow from "@/components/ChatWindow";
import { useAssistantChat } from "@/hooks/useAssistantChat";

export default function ChatPage() {
  const [usePrimeRaccoon, setUsePrimeRaccoon] = useState(false);
  const raccoonFallbackSrc = usePrimeRaccoon ? "/raccoon_prime.png" : "/raccoon.png";

  const {
    isOpen,
    messages,
    botState,
    awaitingResponse,
    showTypingIndicator,
    openChat,
    closeChat,
    sendMessage,
  } = useAssistantChat();

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
        awaitingResponse={awaitingResponse}
        showTypingIndicator={showTypingIndicator}
        onClose={closeChat}
        onSend={sendMessage}
        fallbackImageSrc={raccoonFallbackSrc}
      />
    </div>
  );
}
