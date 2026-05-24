FROM node:22-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm build

FROM node:22-slim AS production
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10 --activate
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/pnpm-lock.yaml ./pnpm-lock.yaml
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
RUN npx playwright install chromium --with-deps \
    && rm -rf /var/lib/apt/lists/*
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"
CMD ["node", "dist/main"]
