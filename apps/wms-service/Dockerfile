FROM node:22.14.0-alpine

# Install jq
RUN apk add --no-cache jq

# Install pm2 with pinned version
RUN npm install -g pm2@5.4.2

# Create a non-root user
RUN addgroup -S appuser && adduser -S -G appuser appuser
WORKDIR /app
RUN chown appuser:appuser /app

# Switch to the non-root user
USER appuser

# Copy your application files with proper ownership
COPY --chown=appuser:appuser package*.json ./

RUN npm install
# Copy the rest of your source code
COPY --chown=appuser:appuser . .

# Build the application
RUN npm run build

# Copy translations AFTER build (jika build tidak handle ini)
COPY --chown=appuser:appuser src/translations ./dist/translations

EXPOSE 3000

CMD ["npm", "start"]
