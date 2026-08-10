import { Header, Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { verifyAccessToken } from "./keycloak";

interface AuthParams {
  authorization: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  username: string;
  roles: string[];
}

export const auth = authHandler<AuthParams, AuthData>(async (params) => {
  const authorization = params.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  if (!token) {
    throw APIError.unauthenticated("missing bearer token");
  }

  try {
    const claims = await verifyAccessToken(token);
    return {
      userID: claims.sub,
      email: claims.email ?? "",
      username: claims.preferred_username ?? claims.sub,
      roles: claims.realm_access?.roles ?? [],
    };
  } catch (err) {
    throw APIError.unauthenticated("invalid or expired token", err as Error);
  }
});

export const gateway = new Gateway({ authHandler: auth });
