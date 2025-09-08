FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN corepack install --global pnpm@10.15.1
RUN corepack use pnpm@10.15.1

FROM base AS builder
WORKDIR /app
RUN pnpm add turbo@2.5.6 --global
COPY . .
RUN turbo prune content-management --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=content-management

FROM base AS production
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer --chown=nestjs:nodejs /app/apps/content-management/dist ./apps/content-management/dist
COPY --from=production --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=production --chown=nestjs:nodejs /app/apps/content-management/node_modules ./apps/content-management/node_modules

CMD ["node", "/app/apps/content-management/dist/main.js"]
