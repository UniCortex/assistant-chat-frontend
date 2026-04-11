import RaccoonStateDisplay from "@/components/RaccoonStateDisplay";
import { BotState } from "@/types";

interface ChatLauncherProps {
  botState: BotState;
  onOpen: () => void;
  fallbackImageSrc?: string;
  onToggleEasterEggRaccoon?: () => void;
}

export default function ChatLauncher({
  botState,
  onOpen,
  fallbackImageSrc,
  onToggleEasterEggRaccoon,
}: ChatLauncherProps) {
  return (
    <div className="launcher-screen">
      <div className="launcher-content">
        <div className="launcher-badge">Официальный помощник</div>

        <div className="launcher-hero">
          <RaccoonStateDisplay
            botState={botState}
            size="large"
            className="launcher-raccoon"
            fallbackImageSrc={fallbackImageSrc}
          />
        </div>

        <div className="launcher-text">
          <h1 className="launcher-title">Чат-бот матфака&nbsp;ЯрГУ</h1>
          <p className="launcher-subtitle">
            Задайте вопрос о поступлении, учёбе<br className="hidden sm:block" /> или жизни на математическом факультете
          </p>
        </div>

        <button className="launcher-cta" onClick={onOpen} aria-label="Открыть чат с помощником">
          <svg
            className="cta-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Задать вопрос
        </button>

        <p className="launcher-hint">Работает без регистрации · Ответ за несколько секунд</p>
      </div>

      <div className="launcher-footer">
        <span>
          Ярославский государственный университет им. П.Г. Демидов
          {onToggleEasterEggRaccoon ? (
            <button
              type="button"
              className="launcher-footer-easter"
              onClick={onToggleEasterEggRaccoon}
              aria-hidden="true"
              tabIndex={-1}
            >
              а
            </button>
          ) : (
            "а"
          )}
        </span>
      </div>
    </div>
  );
}
