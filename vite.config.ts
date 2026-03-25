import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rootDir = path.resolve(import.meta.dirname);

function requiredEnv(loaded: Record<string, string>, key: string): string {
  const v = process.env[key] ?? loaded[key];
  const t = v?.trim();
  if (!t) {
    throw new Error(
      `${key} is required: add it to .env (see .env.example) or set the environment variable.`,
    );
  }
  return t;
}

function requiredPositiveInt(loaded: Record<string, string>, key: string): number {
  const raw = requiredEnv(loaded, key);
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
    throw new Error(`${key} must be a positive integer (got "${raw}")`);
  }
  return n;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");

  const rawPort = process.env.PORT ?? env.PORT;
  if (!rawPort?.trim()) {
    throw new Error(
      "PORT is required: add it to .env (see .env.example) or set the environment variable.",
    );
  }
  const port = Number(rawPort.trim());
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const rawBasePath = process.env.BASE_PATH ?? env.BASE_PATH;
  const basePath = rawBasePath?.trim();
  if (!basePath) {
    throw new Error(
      "BASE_PATH is required: add it to .env (see .env.example) or set the environment variable.",
    );
  }

  const apiBaseUrl = requiredEnv(env, "API_BASE_URL");
  const chatSessionStorageKey = requiredEnv(env, "CHAT_SESSION_STORAGE_KEY");
  const chatSessionTtlHours = requiredPositiveInt(env, "CHAT_SESSION_TTL_HOURS");
  const serverHost = requiredEnv(env, "SERVER_HOST");

  return {
    base: basePath,
    define: {
      "import.meta.env.API_BASE_URL": JSON.stringify(apiBaseUrl),
      "import.meta.env.CHAT_SESSION_STORAGE_KEY": JSON.stringify(chatSessionStorageKey),
      "import.meta.env.CHAT_SESSION_TTL_HOURS": JSON.stringify(String(chatSessionTtlHours)),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: "@/types", replacement: path.resolve(import.meta.dirname, "types") },
        { find: "@assets", replacement: path.resolve(import.meta.dirname, "app", "assets") },
        { find: "@", replacement: path.resolve(import.meta.dirname, "app") },
      ],
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: serverHost,
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: serverHost,
      allowedHosts: true,
    },
  };
});
