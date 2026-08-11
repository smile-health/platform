import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  deleteAssetDongle: vi.fn(),
}));
vi.mock("./asset-dongle.repository", () => repoMock);

import * as service from "./asset-dongle.service";

describe("asset-dongle.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllAssetDongle", () => {
    it("defaults limit/page when missing or invalid", async () => {
      repoMock.findPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getAllAssetDongle({});
      expect(repoMock.findPaginated).toHaveBeenCalledWith({ limit: 10, page: 1, search: undefined });
    });
  });

  describe("createAssetDongle", () => {
    it("throws FailedPrecondition on empty assetId", async () => {
      await expect(service.createAssetDongle({ assetId: "" })).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws InvalidArgument (422-equivalent) when the assetId already has a dongle", async () => {
      repoMock.findById.mockResolvedValue({ assetId: "1" });
      await expect(service.createAssetDongle({ assetId: "1" })).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("creates a new dongle when none exists yet", async () => {
      repoMock.findById.mockResolvedValue(null);
      const entity = { assetId: "1", createdAt: new Date(), updatedAt: new Date() };
      repoMock.create.mockResolvedValue(entity);
      await expect(service.createAssetDongle({ assetId: "1" })).resolves.toEqual(entity);
      expect(repoMock.create).toHaveBeenCalledWith("1");
    });
  });

  describe("deleteAssetDongle", () => {
    it("throws FailedPrecondition when assetId is empty", async () => {
      await expect(service.deleteAssetDongle("")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition when nothing was deleted (not found)", async () => {
      repoMock.deleteAssetDongle.mockResolvedValue(false);
      await expect(service.deleteAssetDongle("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "asset-dongle.error.NOT_FOUND",
      });
    });

    it("returns null on successful delete", async () => {
      repoMock.deleteAssetDongle.mockResolvedValue(true);
      await expect(service.deleteAssetDongle("1", 42)).resolves.toBeNull();
      expect(repoMock.deleteAssetDongle).toHaveBeenCalledWith("1", 42);
    });
  });
});
