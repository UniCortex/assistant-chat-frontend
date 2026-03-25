import { getApiBaseUrl, QUEUE_ENDPOINT } from "./config";

export interface QueueQuestionBody {
  question: string;
  session_id: string;
}

export interface QueueQuestionResponse {
  session_id: string;
  message_id: string;
}

export async function queueQuestion(
  body: QueueQuestionBody,
  signal?: AbortSignal,
): Promise<QueueQuestionResponse> {
  const url = `${getApiBaseUrl()}${QUEUE_ENDPOINT}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as QueueQuestionResponse;
}
