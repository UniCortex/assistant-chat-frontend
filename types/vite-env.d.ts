/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_BASE_URL: string;
  readonly CHAT_SESSION_STORAGE_KEY: string;
  readonly CHAT_SESSION_TTL_HOURS: string;
}
