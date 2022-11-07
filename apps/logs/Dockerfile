FROM node:16-bullseye-slim AS pruner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=logs --docker
RUN find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Base strategy to have layer caching
FROM node:16-bullseye-slim AS base
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
# COPY --from=pruner /app/out/full/ .

FROM base AS dev-deps
WORKDIR /app
RUN corepack enable
RUN pnpm install --ignore-scripts --frozen-lockfile

FROM base AS production-deps
WORKDIR /app
RUN corepack enable
ENV NODE_ENV production
RUN pnpm install --prod --frozen-lockfile
COPY --from=pruner /app/out/full/apps/logs/database/schema.prisma /app/apps/logs/prisma/schema.prisma
RUN pnpx prisma generate --schema /app/apps/logs/prisma/schema.prisma

FROM base AS builder
WORKDIR /app
RUN corepack enable
ENV NODE_ENV production
COPY --from=pruner /app/out/full/ .
COPY --from=dev-deps /app/ .
COPY turbo.json turbo.json
RUN pnpm run generate
RUN pnpm run build --filter=logs...

# Runner
FROM node:16-bullseye-slim AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN corepack enable
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
RUN chown -R fastify:nodejs /app
USER fastify

COPY --from=pruner --chown=fastify:nodejs /app/out/full/ .
COPY --from=production-deps --chown=fastify:nodejs /app .
COPY --from=builder --chown=fastify:nodejs /app/apps/logs/dist/app.js ./apps/logs/dist/app.js
COPY --from=builder --chown=fastify:nodejs /app/apps/logs/dist ./apps/logs/dist
COPY --from=builder --chown=fastify:nodejs /app/apps/logs/database/schema.prisma ./apps/logs/dist/schema.prisma
COPY --from=builder --chown=fastify:nodejs /app/apps/logs/database/migrations ./apps/logs/dist/migrations

CMD ["pnpm", "--filter", "logs", "run", "start"]