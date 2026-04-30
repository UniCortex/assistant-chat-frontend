import type { Message } from "@/types";

const MAX_STORED_MESSAGES = 100;

function storageKey(): string {
  const k = import.meta.env.CHAT_SESSION_STORAGE_KEY;
  if (typeof k !== "string" || !k.trim()) {
    throw new Error("CHAT_SESSION_STORAGE_KEY is not configured");
  }
  return k.trim();
}

function ttlMs(): number {
  const raw = import.meta.env.CHAT_SESSION_TTL_HOURS;
  const hours = Number(raw);
  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error("CHAT_SESSION_TTL_HOURS is not configured or invalid");
  }
  return hours * 60 * 60 * 1000;
}

export interface StoredChatSession {
  sessionId: string;
  expiresAt: number;
}

interface StoredChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: string;
}

interface StoredChatHistory {
  sessionId: string;
  expiresAt: number;
  messages: StoredChatMessage[];
}

function historyStorageKey(): string {
  return `${storageKey()}:messages`;
}

function parseStored(raw: string): StoredChatSession | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (
      data !== null &&
      typeof data === "object" &&
      "sessionId" in data &&
      "expiresAt" in data &&
      typeof (data as StoredChatSession).sessionId === "string" &&
      typeof (data as StoredChatSession).expiresAt === "number"
    ) {
      return data as StoredChatSession;
    }
  } catch {
    return null;
  }
  return null;
}

function parseStoredHistory(raw: string): StoredChatHistory | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (data === null || typeof data !== "object") return null;

    const history = data as Partial<StoredChatHistory>;
    if (
      typeof history.sessionId !== "string" ||
      typeof history.expiresAt !== "number" ||
      !Array.isArray(history.messages)
    ) {
      return null;
    }

    const validatedMessages: StoredChatMessage[] = [];
    for (const entry of history.messages) {
      if (entry === null || typeof entry !== "object") return null;
      const item = entry as Partial<StoredChatMessage>;
      if (
        typeof item.id !== "string" ||
        (item.role !== "user" && item.role !== "bot") ||
        typeof item.text !== "string" ||
        typeof item.timestamp !== "string" ||
        Number.isNaN(Date.parse(item.timestamp))
      ) {
        return null;
      }
      validatedMessages.push({
        id: item.id,
        role: item.role,
        text: item.text,
        timestamp: item.timestamp,
      });
    }

    return {
      sessionId: history.sessionId,
      expiresAt: history.expiresAt,
      messages: validatedMessages,
    };
  } catch {
    return null;
  }
}

function clearStoredSession(): void {
  localStorage.removeItem(storageKey());
}

export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(historyStorageKey());
}

function ensureChatSessionEntry(): StoredChatSession {
  if (typeof window === "undefined") {
    return {
      sessionId: crypto.randomUUID(),
      expiresAt: Date.now() + ttlMs(),
    };
  }

  const key = storageKey();
  const raw = localStorage.getItem(key);
  if (raw) {
    const parsed = parseStored(raw);
    if (parsed !== null && Date.now() < parsed.expiresAt) {
      return parsed;
    }
    clearStoredSession();
    clearChatHistory();
  }

  const entry: StoredChatSession = {
    sessionId: crypto.randomUUID(),
    expiresAt: Date.now() + ttlMs(),
  };
  localStorage.setItem(key, JSON.stringify(entry));
  clearChatHistory();
  return entry;
}

export function ensureChatSession(): string {
  return ensureChatSessionEntry().sessionId;
}

export function loadChatHistory(sessionId: string): Message[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(historyStorageKey());
  if (!raw) return null;

  const parsed = parseStoredHistory(raw);
  if (parsed === null) {
    clearChatHistory();
    return null;
  }

  if (Date.now() >= parsed.expiresAt) {
    clearChatHistory();
    return null;
  }

  if (parsed.sessionId !== sessionId) {
    return null;
  }

  return parsed.messages.slice(-MAX_STORED_MESSAGES).map((msg) => ({
    id: msg.id,
    role: msg.role,
    text: msg.text,
    timestamp: new Date(msg.timestamp),
  }));
}

export function saveChatHistory(sessionId: string, messages: Message[]): void {
  if (typeof window === "undefined") return;
  const session = ensureChatSessionEntry();
  if (session.sessionId !== sessionId || Date.now() >= session.expiresAt) {
    clearChatHistory();
    return;
  }

  const recentMessages = messages.slice(-MAX_STORED_MESSAGES);

  const payload: StoredChatHistory = {
    sessionId,
    expiresAt: session.expiresAt,
    messages: recentMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      text: msg.text,
      timestamp: msg.timestamp.toISOString(),
    })),
  };
  localStorage.setItem(historyStorageKey(), JSON.stringify(payload));
}
