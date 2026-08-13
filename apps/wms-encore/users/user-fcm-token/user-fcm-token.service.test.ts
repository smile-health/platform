import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMocks = vi.hoisted(() => ({
  findByIdentity: vi.fn(),
  createOrUpdateToken: vi.fn(),
}));

vi.mock("./user-fcm-token.repository", () => repoMocks);

import * as service from "./user-fcm-token.service";

const sample = {
  id: 1,
  userId: 42,
  entityId: 7,
  userUuid: "user-uuid",
  token: "fcm-token-value",
  createdAt: new Date("2024-01-01"),
  updatedAt: undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserFcmTokenByIdentity", () => {
  it("throws a plain Error (not APIError) when id is missing", async () => {
    await expect(
      service.getUserFcmTokenByIdentity({ id: undefined, entityId: "7" }),
    ).rejects.toThrow("ID and entity ID are required to get a user FCM token");
    expect(repoMocks.findByIdentity).not.toHaveBeenCalled();
  });

  it("throws a plain Error (not APIError) when entityId is missing", async () => {
    await expect(
      service.getUserFcmTokenByIdentity({ id: "user-uuid", entityId: undefined }),
    ).rejects.toThrow("ID and entity ID are required to get a user FCM token");
    expect(repoMocks.findByIdentity).not.toHaveBeenCalled();
  });

  it("throws a plain Error (not APIError) when not found", async () => {
    repoMocks.findByIdentity.mockResolvedValue(null);
    await expect(
      service.getUserFcmTokenByIdentity({ id: "user-uuid", entityId: "7" }),
    ).rejects.toThrow("User FCM token not found");
  });

  it("returns the token on the happy path, converting entityId to a number", async () => {
    repoMocks.findByIdentity.mockResolvedValue(sample);
    const result = await service.getUserFcmTokenByIdentity({
      id: "user-uuid",
      entityId: "7",
    });
    expect(result).toEqual(sample);
    expect(repoMocks.findByIdentity).toHaveBeenCalledWith("user-uuid", 7);
  });

  it("errors thrown are not instances of a custom error class (plain Error)", async () => {
    repoMocks.findByIdentity.mockResolvedValue(null);
    try {
      await service.getUserFcmTokenByIdentity({ id: "x", entityId: "1" });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as { code?: unknown }).code).toBeUndefined();
    }
  });
});

describe("createOrUpdateFcmToken", () => {
  it("delegates directly to the repository upsert with no extra validation", async () => {
    repoMocks.createOrUpdateToken.mockResolvedValue(sample);
    const result = await service.createOrUpdateFcmToken({
      userId: 42,
      entityId: 7,
      userUuid: "user-uuid",
      token: "fcm-token-value",
    });
    expect(result).toEqual(sample);
    expect(repoMocks.createOrUpdateToken).toHaveBeenCalledWith({
      userId: 42,
      entityId: 7,
      userUuid: "user-uuid",
      token: "fcm-token-value",
    });
  });
});
