import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { loginWithPassword } from "./keycloak";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Logs a user in against the existing SMILE Keycloak realm.
export const login = api(
  { method: "POST", path: "/auth/login", expose: true },
  async (req: LoginRequest): Promise<LoginResponse> => {
    try {
      const token = await loginWithPassword(req.username, req.password);
      return {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid credentials", err as Error);
    }
  },
);

interface MeResponse {
  userID: string;
  email: string;
  username: string;
  roles: string[];
}

// Returns the currently authenticated user, as resolved from the Keycloak access token.
export const me = api(
  { method: "GET", path: "/auth/me", expose: true, auth: true },
  async (): Promise<MeResponse> => {
    const auth = getAuthData()!;
    return {
      userID: auth.userID,
      email: auth.email,
      username: auth.username,
      roles: auth.roles,
    };
  },
);
