import RaccoonStateDisplay from "@/components/RaccoonStateDisplay";
import { BotState } from "@/types";

interface ChatHeaderProps {
  botState: BotState;
  isBotTyping: boolean;
  onClose: () => void;
  fallbackImageSrc?: string;
}

export default function ChatHeader({
  botState,
  isBotTyping,
  onClose,
  fallbackImageSrc,
}: ChatHeaderProps) {
  const statusText =
    botState === "thinking" || isBotTyping ? "Печатает..." : "Онлайн · Готов помочь";

  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <RaccoonStateDisplay
          botState={botState}
          size="small"
          className="header-raccoon"
          fallbackImageSrc={fallbackImageSrc}
        />
        <div className="chat-header-text">
          <span className="chat-header-name">Помощник матфака ЯрГУ</span>
          <span className="chat-header-status" data-thinking={isBotTyping}>
            {statusText}
          </span>
        </div>
      </div>

      <button
        className="chat-close-btn"
        onClick={onClose}
        aria-label="Закрыть чат"
        title="Закрыть"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
