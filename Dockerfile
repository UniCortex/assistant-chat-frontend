# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.json tsconfig.base.json ./
COPY vite.config.ts index.html components.json ./
COPY app ./app
COPY public ./public
COPY types ./types

ARG BASE_PATH=/
ENV BASE_PATH=${BASE_PATH}

RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN groupadd -r nodejs && useradd -r -g nodejs -m -d /home/nodejs nodejs

COPY --from=builder /app /app

RUN chown -R nodejs:nodejs /app /home/nodejs

USER nodejs

ENV HOME=/home/nodejs
ENV PORT=5173

EXPOSE 5173

CMD ["node", "node_modules/vite/bin/vite.js", "preview", "--config", "vite.config.ts", "--host", "0.0.0.0"]
