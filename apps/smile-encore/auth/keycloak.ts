import { createRemoteJWKSet, jwtVerify } from "jose";
import { keycloakConfig } from "../config";

// This Keycloak deployment is misconfigured behind its proxy: its OIDC discovery
// document and the `iss` claim it stamps into tokens both advertise a `/auth`
// prefix, but the actual reachable HTTP routes for the token/certs endpoints do
// NOT have that prefix (confirmed by direct testing — the `/auth`-prefixed paths
// 404). So: call the real, prefix-less endpoints, but verify the token issuer
// against the `/auth`-prefixed value Keycloak actually puts in the JWT.
const realmBase = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}`;
const tokenEndpoint = `${realmBase}/protocol/openid-connect/token`;
const jwksUri = `${realmBase}/protocol/openid-connect/certs`;
const expectedIssuer = `${keycloakConfig.serverUrl}/auth/realms/${keycloakConfig.realm}`;

const jwks = createRemoteJWKSet(new URL(jwksUri));

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface KeycloakClaims {
  sub: string;
  email?: string;
  preferred_username?: string;
  realm_access?: { roles: string[] };
}

export async function loginWithPassword(username: string, password: string): Promise<KeycloakTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: keycloakConfig.clientId,
    username,
    password,
  });
  if (keycloakConfig.clientSecret) {
    body.set("client_secret", keycloakConfig.clientSecret);
  }

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keycloak login failed (${res.status}): ${text}`);
  }

  return (await res.json()) as KeycloakTokenResponse;
}

export async function verifyAccessToken(token: string): Promise<KeycloakClaims> {
  const { payload } = await jwtVerify(token, jwks, { issuer: expectedIssuer });
  return payload as unknown as KeycloakClaims;
}
