import "dotenv/config";

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const dbConfig = {
  host: env("DB_HOST", "localhost"),
  port: Number(env("DB_PORT", "3306")),
  user: env("DB_USER", "root"),
  password: env("DB_PASSWORD", ""),
  database: env("DB_NAME", "dev_smile_health_encore"),
};

export const keycloakConfig = {
  serverUrl: env("KEYCLOAK_SERVER_URL", "http://localhost:8081"),
  realm: env("KEYCLOAK_REALM", "smile-health"),
  clientId: env("KEYCLOAK_CLIENT_ID", "smile-health"),
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || undefined,
};
