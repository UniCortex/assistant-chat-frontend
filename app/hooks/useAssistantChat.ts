import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Message, BotState } from "@/types";
import { ensureChatSession } from "@/lib/session/chatSession";
import { queueQuestion } from "@/lib/api/queueQuestion";
import { pollAnswer, PollAnswerResponse } from "@/lib/api/pollAnswer";
import { isAbortError } from "@/lib/api/isAbortError";

const WELCOME_TEXT =
  "Привет! 👋 Я — енот-ассистент математического факультета ЯрГУ им. П.Г. Демидова.\n\n" +
  "Знаю всё про матфак:\n" +
  "— поступление, проходные баллы и экзамены\n" +
  "— направления подготовки и специальности\n" +
  "— учебный процесс, преподавателей и расписание\n" +
  "— студенческую жизнь факультета\n\n" +
  "⚠️ По другим факультетам я не специализируюсь — за такой информацией лучше зайти на https://www.uniyar.ac.ru\n\n" +
  "Есть вопросы про матфак? Спрашивай — помогу! 🦝";

export function useAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [botState, setBotState] = useState<BotState>("idle");
  const [awaitingResponse, setAwaitingResponse] = useState(false);

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

    const controller = new AbortController();
    streamAbortRef.current = controller;

    try {
      const sessionId = ensureChatSession();
      const { message_id } = await queueQuestion(
        { question: text, session_id: sessionId },
        controller.signal,
      );

      const botId = message_id;

      let result: PollAnswerResponse | null = null;
      while (result === null) {
        result = await pollAnswer(sessionId, message_id, controller.signal);
        if (result === null) {
          await new Promise((res) => setTimeout(res, 1500));
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: botId,
          role: "bot",
          text: result.answer ?? "Ответ не получен. Попробуйте задать вопрос ещё раз.",
          timestamp: new Date(),
        },
      ]);

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
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
    }
  }, []);

  const showTypingIndicator = awaitingResponse;

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
