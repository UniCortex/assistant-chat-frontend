function readEnv(key: keyof ImportMetaEnv): string {
  const v = import.meta.env[key];
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`${String(key)} is not configured`);
  }
  return v.trim();
}

export function getApiBaseUrl(): string {
  return readEnv("API_BASE_URL").replace(/\/+$/, "");
}

export const QUEUE_ENDPOINT = "/api/v1/queuing/";
