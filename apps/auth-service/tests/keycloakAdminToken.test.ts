import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

vi.mock("axios");

const ENV_KEYS = ["KEYCLOAK_ADMIN_CLIENT_ID", "KEYCLOAK_CLIENT_ID"] as const;

async function loadClient() {
  vi.resetModules();
  const mod = await import("../src/keycloakClient");
  return mod.default as any;
}

function postedParams(): URLSearchParams {
  const call = vi.mocked(axios.post).mock.calls[0];
  return call[1] as URLSearchParams;
}

describe("KeycloakClient realm admin token", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) saved[k] = process.env[k];
    vi.mocked(axios.get).mockResolvedValue({ status: 200 });
    vi.mocked(axios.post).mockReset();
    vi.mocked(axios.post).mockResolvedValue({
      data: { access_token: "admin-token", expires_in: 60 },
    });
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("requests the admin token through admin-cli by default", async () => {
    delete process.env.KEYCLOAK_ADMIN_CLIENT_ID;
    process.env.KEYCLOAK_CLIENT_ID = "smile";
    const client = await loadClient();

    const token = await client._getRealmAdminToken();

    expect(token).toBe("admin-token");
    const params = postedParams();
    expect(params.get("client_id")).toBe("admin-cli");
    expect(params.get("grant_type")).toBe("password");
  });

  it("honours KEYCLOAK_ADMIN_CLIENT_ID override", async () => {
    process.env.KEYCLOAK_ADMIN_CLIENT_ID = "smile";
    const client = await loadClient();

    await client._getRealmAdminToken();

    expect(postedParams().get("client_id")).toBe("smile");
  });

  it("keeps user login on the application client", async () => {
    delete process.env.KEYCLOAK_ADMIN_CLIENT_ID;
    process.env.KEYCLOAK_CLIENT_ID = "smile";
    const client = await loadClient();
    vi.mocked(axios.post).mockResolvedValue({ data: { access_token: "user" } });

    await client.getToken("someone", "secret");

    expect(postedParams().get("client_id")).toBe("smile");
  });

  it("throws a clear error when the admin token request fails", async () => {
    const client = await loadClient();
    vi.mocked(axios.post).mockRejectedValue(new Error("boom"));

    await expect(client._getRealmAdminToken()).rejects.toThrow(
      "Failed to get realm admin token from Keycloak"
    );
  });
});
