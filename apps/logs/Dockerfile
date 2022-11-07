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
COPY --from=pruner /app/out/full/apps/logs/prisma/schema.prisma /app/apps/logs/prisma/schema.prisma
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
RUN adduser --system --uid 1001 remixjs
RUN chown -R remixjs:nodejs /app
USER remixjs

COPY --from=pruner --chown=remixjs:nodejs /app/out/full/ .
COPY --from=production-deps --chown=remixjs:nodejs /app .
COPY --from=builder --chown=remixjs:nodejs /app/apps/logs/app/styles/tailwind.css ./apps/logs/app/styles/tailwind.css
COPY --from=builder --chown=remixjs:nodejs /app/apps/logs/build/server.js ./apps/logs/build/server.js
COPY --from=builder --chown=remixjs:nodejs /app/apps/logs/build ./apps/logs/build
COPY --from=builder --chown=remixjs:nodejs /app/apps/logs/public ./apps/logs/public
COPY --from=builder --chown=remixjs:nodejs /app/apps/logs/prisma/schema.prisma ./apps/logs/build/schema.prisma
COPY --from=builder --chown=remixjs:nodejs /app/apps/logs/prisma/migrations ./apps/logs/build/migrations
COPY --from=builder --chown=remixjs:nodejs /app/apps/logs/node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node ./apps/logs/build/libquery_engine-debian-openssl-1.1.x.so.node

# release_command = "pnpx prisma migrate deploy --schema apps/logs/prisma/schema.prisma"
CMD ["pnpm", "--filter", "webapp", "run", "start"]