import BotChatAvatar from "@/components/BotChatAvatar";

export default function TypingIndicator() {
  return (
    <div className="message-row message-row--bot">
      <BotChatAvatar />
      <div className="message-bubble message-bubble--bot typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
