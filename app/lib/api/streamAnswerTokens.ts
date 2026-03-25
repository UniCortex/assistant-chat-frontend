import { getApiBaseUrl, STREAM_ENDPOINT } from "./config";

function parseSseEventBlock(block: string): { event: string; data: string } | null {
  const lines = block.split("\n");
  let eventName = "";
  const dataParts: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataParts.push(line.slice(5).trimStart());
    }
  }

  if (!eventName && dataParts.length === 0) {
    return null;
  }

  return {
    event: eventName || "message",
    data: dataParts.join("\n"),
  };
}

export async function* streamAnswerTokens(
  sessionId: string,
  messageId: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, undefined> {
  const url = new URL(`${getApiBaseUrl()}${STREAM_ENDPOINT}`);
  url.searchParams.set("session_id", sessionId);
  url.searchParams.set("message_id", messageId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "text/event-stream",
    },
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Stream failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawBlock = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const parsed = parseSseEventBlock(rawBlock);
        if (!parsed) continue;

        if (parsed.event === "done") {
          return;
        }
        if (parsed.event === "token") {
          yield parsed.data;
        }
      }
    }

    const tail = buffer.trim();
    if (tail) {
      const parsed = parseSseEventBlock(tail);
      if (parsed?.event === "done") {
        return;
      }
      if (parsed?.event === "token") {
        yield parsed.data;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
