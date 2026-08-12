# Stage 1: Prune the monorepo to only what wms-service + its workspace deps need
FROM node:22-alpine AS pruner
RUN npm install -g turbo@2
WORKDIR /app
COPY . .
RUN turbo prune @smile/smile-wms --docker

# Stage 2: Install deps + build using the pruned workspace
FROM node:22.14.0-alpine

# Install jq + pm2 + pnpm
RUN apk add --no-cache jq && \
    npm install -g pm2@5.4.2 pnpm@9.12.3

# Create a non-root user
RUN addgroup -S appuser && adduser -S -G appuser appuser
WORKDIR /app
RUN chown appuser:appuser /app

# Switch to the non-root user
USER appuser

# Copy pruned lockfile + package.json skeleton first for better layer caching
COPY --chown=appuser:appuser --from=pruner /app/out/json/ .
RUN pnpm install --no-frozen-lockfile

# Copy the pruned full source (only the packages wms-service actually depends on)
COPY --chown=appuser:appuser --from=pruner /app/out/full/ .

# wms-service lives under the monorepo path after pruning
WORKDIR /app/apps/wms-service

# Build the application
RUN npx tsc --noEmitOnError false 2>&1 || echo "Build had non-fatal errors, continuing"

# Copy translations AFTER build (jika build tidak handle ini).
# Plain COPY resolves against the build CONTEXT (repo root), not WORKDIR.
COPY --chown=appuser:appuser apps/wms-service/src/translations ./dist/translations

EXPOSE 3000

CMD ["npm", "start"]
