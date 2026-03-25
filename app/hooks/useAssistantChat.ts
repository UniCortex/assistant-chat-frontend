import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Message, BotState } from "@/types";
import { ensureChatSession } from "@/lib/session/chatSession";
import { queueQuestion } from "@/lib/api/queueQuestion";
import { streamAnswerTokens } from "@/lib/api/streamAnswerTokens";
import { isAbortError } from "@/lib/api/isAbortError";

const WELCOME_TEXT =
  "Привет! Я помощник ЯрГУ. Больше всего специализируюсь на матфаке и факультете ИВТ, но и по другим факультетам могу помочь. Буду рад помочь!";

export function useAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [botState, setBotState] = useState<BotState>("idle");
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [streamPrimed, setStreamPrimed] = useState(false);

  const streamAbortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  const openChat = useCallback(() => {
    ensureChatSession();
    setIsOpen(true);
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: "welcome",
          role: "bot",
          text: WELCOME_TEXT,
          timestamp: new Date(),
        },
      ];
    });
  }, []);

  const closeChat = useCallback(() => {
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setBotState("thinking");
    setAwaitingResponse(true);
    setStreamPrimed(false);

    const controller = new AbortController();
    streamAbortRef.current = controller;

    try {
      const sessionId = ensureChatSession();
      const { message_id } = await queueQuestion(
        { question: text, session_id: sessionId },
        controller.signal,
      );

      const botId = message_id;
      let receivedToken = false;

      for await (const token of streamAnswerTokens(sessionId, message_id, controller.signal)) {
        if (!receivedToken) {
          receivedToken = true;
          setStreamPrimed(true);
        }
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === botId);
          if (idx === -1) {
            const botMessage: Message = {
              id: botId,
              role: "bot",
              text: token,
              timestamp: new Date(),
            };
            return [...prev, botMessage];
          }
          return prev.map((m) => (m.id === botId ? { ...m, text: m.text + token } : m));
        });
      }

      if (!receivedToken) {
        setStreamPrimed(true);
        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            role: "bot",
            text: "Ответ не получен. Попробуйте задать вопрос ещё раз.",
            timestamp: new Date(),
          },
        ]);
      }

      setBotState("eureka");
      setTimeout(() => {
        setBotState("idle");
      }, 2500);
    } catch (err) {
      if (isAbortError(err)) {
        setBotState("idle");
        return;
      }
      const message = err instanceof Error ? err.message : "Не удалось получить ответ";
      toast.error(message);
      setBotState("idle");
    } finally {
      inFlightRef.current = false;
      setAwaitingResponse(false);
      setStreamPrimed(false);
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
    }
  }, []);

  const showTypingIndicator = awaitingResponse && !streamPrimed;

  return {
    isOpen,
    messages,
    botState,
    awaitingResponse,
    showTypingIndicator,
    openChat,
    closeChat,
    sendMessage,
  };
}
