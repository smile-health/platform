FROM node:18-alpine3.19 AS base

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat jq && rm -rf /var/cache/apk/*
RUN npm install -g pnpm@9.12.3 turbo

WORKDIR /app
COPY . .

# Fix @smile-health/lib to use workspace:* so pnpm resolves from packages/lib/
RUN jq '.dependencies["@smile-health/lib"] = "workspace:*"' package.json > /tmp/pkg.json && mv /tmp/pkg.json package.json

# Install all workspace deps (needed for turbo build)
RUN pnpm install --frozen-lockfile=false

# Build only the web app
ENV TURBO_API=http://dev.badr.co.id:12000
ENV TURBO_TEAM=web
RUN npx turbo build --filter=web

FROM base AS runner
WORKDIR /app

RUN apk update && apk add --no-cache jq && rm -rf /var/cache/apk/*
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

CMD node apps/web/server.js