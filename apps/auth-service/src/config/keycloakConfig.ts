import dotenv from "dotenv";

dotenv.config();

export default {
  serverUrl: process.env.KEYCLOAK_SERVER_URL || "http://localhost:8080",
  realm: process.env.KEYCLOAK_REALM || "your-realm",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "your-client",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
  // Client used to obtain the realm admin token. Keycloak 26.x only accepts admin
  // API tokens carrying the `kc-admin-api` audience, which `admin-cli` gets by
  // default; older Keycloak versions accept `admin-cli` tokens as well.
  adminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || "admin-cli",
  realmAdminUser: process.env.REALM_SYSUSER_NAME || "sysuser",
  realmAdminPass: process.env.REALM_SYSUSER_PASS || "sysuser",
};
