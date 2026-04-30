import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const QUICK_QUESTIONS = [
  "Какие направления есть на матфаке?",
  "Какие проходные баллы на матфак?",
  "Как подать документы на матфак?",
  "Есть ли общежитие для студентов матфака?",
  "Где находится матфак ЯрГУ?",
];

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const showQuick = !disabled;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuick = (question: string) => {
    onSend(question);
  };

  return (
    <div className="chat-input-area">
      {showQuick && (
        <div className="quick-questions">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              className="quick-btn"
              onClick={() => handleQuick(q)}
              disabled={disabled}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Введите вопрос..."
          rows={1}
          disabled={disabled}
          aria-label="Поле ввода сообщения"
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Отправить"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
