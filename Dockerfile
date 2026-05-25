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
RUN groupadd -r appgroup && useradd -r -g appgroup appuser \
    && mkdir -p /home/appuser/.cache \
    && chown -R appuser:appgroup /home/appuser
RUN mkdir -p /app && chown appuser:appgroup /app
WORKDIR /app

# Crear directorio para migraciones generadas dinámicamente (volumen persistente)
RUN mkdir -p /app/drizzle && chown appuser:appgroup /app/drizzle

# 0. Copiar manifestos y config para que drizzle-kit funcione
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=appuser:appgroup /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=appuser:appgroup /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=appuser:appgroup /app/src/database/schema ./src/database/schema

# 1. Copiar node_modules completos (incluye devDependencies para migraciones y seeds)
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# 2. Instalar dependencias del sistema para Chromium (cacheable mientras no cambie package.json)
RUN npx playwright install-deps chromium \
    && rm -rf /var/lib/apt/lists/*

# 3. Copiar browsers de Playwright desde la capa cacheable
COPY --from=playwright-cache --chown=appuser:appgroup /app/.cache/ms-playwright /app/.cache/ms-playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright

# 4. Copiar dist al final para que solo invalide esta capa cuando cambie el código
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# 5. Copiar entrypoint script
COPY --from=builder --chown=appuser:appgroup /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"
ENTRYPOINT ["./entrypoint.sh"]
