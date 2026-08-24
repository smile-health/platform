import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  updateStatus: vi.fn(),
}));
vi.mock("./users.repository", () => repoMock);

import * as service from "./users.service";

describe("users.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("returns the paginated list for a super_admin with no userId supplied", async () => {
      const result = { data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } };
      repoMock.findPaginated.mockResolvedValue(result);

      await expect(
        service.getAllUsers({ isSuperAdmin: true, callerUserId: 1, userId: undefined })
      ).resolves.toEqual(result);
      expect(repoMock.findPaginated).toHaveBeenCalled();
      expect(repoMock.findById).not.toHaveBeenCalled();
    });

    it("looks up a single user when a super_admin passes an explicit userId", async () => {
      const user = { id: 5, userUuid: "u", entityId: 1 };
      repoMock.findById.mockResolvedValue(user);

      await expect(
        service.getAllUsers({ isSuperAdmin: true, callerUserId: 1, userId: 5 })
      ).resolves.toEqual(user);
      expect(repoMock.findById).toHaveBeenCalledWith(5);
      expect(repoMock.findPaginated).not.toHaveBeenCalled();
    });

    it("looks up the caller's own user for a non-super-admin, ignoring other filters", async () => {
      const user = { id: 9, userUuid: "u", entityId: 1 };
      repoMock.findById.mockResolvedValue(user);

      await expect(
        service.getAllUsers({ isSuperAdmin: false, callerUserId: 9, entityId: 123 })
      ).resolves.toEqual(user);
      expect(repoMock.findById).toHaveBeenCalledWith(9);
    });

    it("returns null (success, not an error) when the single-user lookup finds nothing", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(
        service.getAllUsers({ isSuperAdmin: false, callerUserId: 9 })
      ).resolves.toBeNull();
    });

    it("throws Internal when neither a super_admin's list branch nor a resolvable userId applies", async () => {
      await expect(
        service.getAllUsers({ isSuperAdmin: false, callerUserId: 0 })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });
  });

  describe("updateUsers", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.updateUsers("", true)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.updateUsers("abc", true)).rejects.toBeInstanceOf(APIError);
    });

    it("throws InvalidArgument when is_active is not boolean/0/1", async () => {
      await expect(service.updateUsers("1", "not-a-boolean")).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("accepts the legacy numeric 0/1 form and coerces to boolean", async () => {
      const updated = { id: 1, userUuid: "u", entityId: 1, isActive: true };
      repoMock.updateStatus.mockResolvedValue(updated);
      await expect(service.updateUsers("1", 1)).resolves.toEqual(updated);
      expect(repoMock.updateStatus).toHaveBeenCalledWith(1, true);
    });

    it("throws FailedPrecondition when the user does not exist", async () => {
      repoMock.updateStatus.mockResolvedValue(null);
      await expect(service.updateUsers("1", true)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Users not found",
      });
    });

    it("returns the updated user on success", async () => {
      const updated = { id: 1, userUuid: "u", entityId: 1, isActive: false };
      repoMock.updateStatus.mockResolvedValue(updated);
      await expect(service.updateUsers("1", false)).resolves.toEqual(updated);
      expect(repoMock.updateStatus).toHaveBeenCalledWith(1, false);
    });
  });
});
