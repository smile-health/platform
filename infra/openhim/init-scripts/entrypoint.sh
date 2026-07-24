#!/bin/bash
##############################################################################
# OpenHIM Container Entrypoint
#
# Starts OpenHIM Core, waits for it to be ready, then runs initialization
# scripts. If any critical step fails the container exits with a non-zero
# code so Docker / compose can detect and report the failure.
##############################################################################

set -e
trap 'echo "[entrypoint] Script failed at line $LINENO — exiting"; exit 1' ERR

OPENHIM_HOST="${OPENHIM_HOST:-localhost}"
OPENHIM_API_PORT="${OPENHIM_CORE_PORT:-8080}"
MAX_WAIT_SECONDS=120

echo "[entrypoint] Starting OpenHIM Core..."
npm start &
OPENHIM_PID=$!

# Verify the process actually started — give it 5 seconds
sleep 5
if ! kill -0 "$OPENHIM_PID" 2>/dev/null; then
  echo "[entrypoint] OpenHIM Core process died immediately — aborting"
  exit 1
fi

echo "[entrypoint] Waiting for OpenHIM API at https://${OPENHIM_HOST}:${OPENHIM_API_PORT}/heartbeat (max ${MAX_WAIT_SECONDS}s)..."

waited=0
while [ "$waited" -lt "$MAX_WAIT_SECONDS" ]; do
  if curl -sk "https://${OPENHIM_HOST}:${OPENHIM_API_PORT}/heartbeat" >/dev/null 2>&1; then
    echo "[entrypoint] OpenHIM API is ready (${waited}s)"
    break
  fi

  # Check process is still alive while waiting
  if ! kill -0 "$OPENHIM_PID" 2>/dev/null; then
    echo "[entrypoint] OpenHIM Core process exited unexpectedly while waiting — aborting"
    exit 1
  fi

  waited=$((waited + 1))
  sleep 1
done

if [ "$waited" -ge "$MAX_WAIT_SECONDS" ]; then
  echo "[entrypoint] Timed out waiting for OpenHIM after ${MAX_WAIT_SECONDS}s — aborting"
  kill "$OPENHIM_PID" 2>/dev/null || true
  exit 1
fi

echo "[entrypoint] Running admin user initialization..."
if ! bash /app/init-scripts/init-admin-user.sh; then
  echo "[entrypoint] Admin user initialization failed — container will exit"
  kill "$OPENHIM_PID" 2>/dev/null || true
  exit 1
fi

echo "[entrypoint] Running config import..."
if ! node /app/init-scripts/import-config.js; then
  echo "[entrypoint] Config import failed — container will exit"
  kill "$OPENHIM_PID" 2>/dev/null || true
  exit 1
fi

echo "[entrypoint] Initialization complete — handing off to OpenHIM (PID $OPENHIM_PID)"
wait "$OPENHIM_PID"
