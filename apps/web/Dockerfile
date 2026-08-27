FROM node:18-alpine3.19 AS base

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat jq python3 make g++ && rm -rf /var/cache/apk/*
RUN npm install -g pnpm@9.12.3 turbo

# NEXT_PUBLIC_* vars are inlined at build time by Next.js. They MUST be present
# here (as ARG defaults) so the image always bakes the correct values, even when
# CI does not pass build args. Override via --build-arg when needed.
ARG NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://smile-indonesia.firebaseio.com
ARG NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBU7Kv5lSHhVd-emcIgwVUQrN5bo3ZPNo8
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smile-platform.firebaseapp.com
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=smile-platform
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smile-platform.firebasestorage.app
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=39330161703
ARG NEXT_PUBLIC_FIREBASE_APP_ID=1:39330161703:web:097f935a8dbfa219c41a02
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WTEE61PVKP
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY=BPPiNOhG978_S-w4j_IngrdwEoZAQvvVxgLaWMB7uruibku6csxq1U5_n5oeyFaeTb5WLp5VBmXMD564Aw5vZ0w
ARG NEXT_PUBLIC_URL_FE_SMILE=
ARG NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER=7wgDjyVS3VZv
ARG NEXT_PUBLIC_NOVU_BACKEND_URL=https://novu-api.badr.co.id
ARG NEXT_PUBLIC_NOVU_SOCKET_URL=wss://novu-ws.badr.co.id

ENV NEXT_PUBLIC_FIREBASE_DATABASE_URL=$NEXT_PUBLIC_FIREBASE_DATABASE_URL \
    NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID \
    NEXT_PUBLIC_FIREBASE_VAPID_KEY=$NEXT_PUBLIC_FIREBASE_VAPID_KEY \
    NEXT_PUBLIC_URL_FE_SMILE=$NEXT_PUBLIC_URL_FE_SMILE \
    NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER=$NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER \
    NEXT_PUBLIC_NOVU_BACKEND_URL=$NEXT_PUBLIC_NOVU_BACKEND_URL \
    NEXT_PUBLIC_NOVU_SOCKET_URL=$NEXT_PUBLIC_NOVU_SOCKET_URL

WORKDIR /app
COPY . .

# Fix all @smile-health/lib references to use workspace:* so pnpm resolves locally
RUN find . -name package.json -not -path '*/node_modules/*' -exec sh -c \
    'jq "if .dependencies[\"@smile-health/lib\"] then .dependencies[\"@smile-health/lib\"] = \"workspace:*\" else . end" "$1" > /tmp/pkg.json && mv /tmp/pkg.json "$1"' _ {} \;

# Pin nanoid to CJS-compatible version (pnpm resolves ESM-only v6 which breaks postcss)
RUN jq '.pnpm.overrides = {nanoid: "3.3.7"}' package.json > /tmp/pkg.json && mv /tmp/pkg.json package.json

# Install all workspace deps
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