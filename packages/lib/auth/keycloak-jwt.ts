import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface KeycloakJwksConfig {
  serverUrl: string;
  realm: string;
  audience?: string;
}

export class KeycloakJwtVerifier {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience?: string;

  constructor(config: KeycloakJwksConfig) {
    this.issuer = `${config.serverUrl.replace(/\/$/, "")}/realms/${config.realm}`;
    this.audience = config.audience;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/protocol/openid-connect/certs`)
    );
  }

  async verify(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return payload;
  }
}
