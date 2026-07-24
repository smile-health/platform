ARG OPENHIM_VERSION=v8.5.0
FROM jembi/openhim-core:${OPENHIM_VERSION}

USER root

# Install curl for health checks and bash for scripts
RUN apk add --no-cache curl bash

# Copy OpenHIM configuration (for importing via JSON)
COPY infra/openhim/config /etc/openhim/config/

# Copy initialization scripts
COPY infra/openhim/init-scripts/ /app/init-scripts/

# Fix line endings (convert CRLF to LF for Windows-created files) and set permissions
RUN find /app/init-scripts -name "*.sh" -exec sed -i 's/\r$//' {} \; && find /app/init-scripts -name "*.js" -exec sed -i 's/\r$//' {} \; && chmod +x /app/init-scripts/*.sh /app/init-scripts/*.js && chmod -R 644 /etc/openhim/config/

# Health check - increased start period to allow full initialization
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -k https://localhost:8080/heartbeat || exit 1

# Start OpenHIM via entrypoint which handles readiness polling and initialization.
# Exits with a non-zero code if OpenHIM fails to start or any init step fails,
# so Docker / compose can detect and surface the failure clearly.
CMD ["bash", "/app/init-scripts/entrypoint.sh"]
