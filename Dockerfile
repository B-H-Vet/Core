FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN pnpm install --frozen-lockfile

FROM deps AS playwright-cache
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright
RUN npx playwright install chromium

FROM deps AS builder
COPY . .
RUN pnpm build

FROM node:22-slim AS production
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10 --activate
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app

# 1. Copiar package files e instalar dependencias de prod (cacheable)
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 2. Instalar dependencias del sistema para Chromium (cacheable mientras no cambie package.json)
RUN npx playwright install-deps chromium \
    && rm -rf /var/lib/apt/lists/*

# 3. Copiar browsers de Playwright desde la capa cacheable
COPY --from=playwright-cache --chown=appuser:appgroup /app/.cache/ms-playwright /app/.cache/ms-playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright

# 4. Copiar dist al final para que solo invalide esta capa cuando cambie el código
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"
CMD ["node", "dist/main"]
