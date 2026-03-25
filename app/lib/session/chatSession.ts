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

export function ensureChatSession(): string {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  const key = storageKey();
  const raw = localStorage.getItem(key);
  if (raw) {
    const parsed = parseStored(raw);
    if (parsed !== null && Date.now() < parsed.expiresAt) {
      return parsed.sessionId;
    }
  }

  const sessionId = crypto.randomUUID();
  const entry: StoredChatSession = {
    sessionId,
    expiresAt: Date.now() + ttlMs(),
  };
  localStorage.setItem(key, JSON.stringify(entry));
  return sessionId;
}
