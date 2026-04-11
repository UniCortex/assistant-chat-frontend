import { getApiBaseUrl, QUEUE_ENDPOINT } from "./config";

export interface PollAnswerResponse {
  session_id: string;
  message_id: string;
  status: string;
  answer: string | null;
}

/**
 * Returns null when the server reports "not ready yet" → caller should retry.
 * Throws on any other non-OK response.
 */
export async function pollAnswer(
  sessionId: string,
  messageId: string,
  signal?: AbortSignal,
): Promise<PollAnswerResponse | null> {
  const url = new URL(`${getApiBaseUrl()}${QUEUE_ENDPOINT}`);
  url.searchParams.set("session_id", sessionId);
  url.searchParams.set("message_id", messageId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    if (text.includes("not ready yet")) {
      return null;
    }
    throw new Error(text || `Poll failed: ${response.status}`);
  }

  return (await response.json()) as PollAnswerResponse;
}
