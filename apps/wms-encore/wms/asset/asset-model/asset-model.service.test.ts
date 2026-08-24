import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  manufacturerExists: vi.fn(),
  isReferencedByHealthcareFacilityAsset: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./asset-model.repository", () => repoMock);

import * as service from "./asset-model.service";

const validBody = {
  assetType: "SCALE",
  manufacturerId: 1,
  name: "Model X",
  description: "desc",
};

describe("asset-model.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAssetModelById", () => {
    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getAssetModelById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Asset model not found",
      });
    });

    it("returns the entity on success", async () => {
      const entity = { id: 1, ...validBody, createdBy: "u", updatedBy: "u" };
      repoMock.findById.mockResolvedValue(entity);
      await expect(service.getAssetModelById("1")).resolves.toEqual(entity);
    });
  });

  describe("createAssetModel", () => {
    it("throws InvalidArgument on empty name", async () => {
      await expect(
        service.createAssetModel({ createdBy: "u", ...validBody, name: "" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws InvalidArgument when the manufacturer does not exist", async () => {
      repoMock.manufacturerExists.mockResolvedValue(false);
      await expect(service.createAssetModel({ createdBy: "u", ...validBody })).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
        message: "NOT_FOUND_MANUFACTURER",
      });
    });

    it("creates with updatedBy defaulted to createdBy", async () => {
      repoMock.manufacturerExists.mockResolvedValue(true);
      const entity = { id: 1, ...validBody, createdBy: "u", updatedBy: "u" };
      repoMock.create.mockResolvedValue(entity);
      const result = await service.createAssetModel({ createdBy: "u", ...validBody });
      expect(result).toEqual(entity);
      expect(repoMock.create).toHaveBeenCalledWith({ createdBy: "u", ...validBody });
    });
  });

  describe("updateAssetModel", () => {
    it("throws Internal (mirrors the original's res.error, not res.fail) when id is empty", async () => {
      await expect(
        service.updateAssetModel({ id: "", updatedBy: "u", ...validBody })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("throws InvalidArgument when the manufacturer does not exist", async () => {
      repoMock.manufacturerExists.mockResolvedValue(false);
      await expect(
        service.updateAssetModel({ id: "1", updatedBy: "u", ...validBody })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.manufacturerExists.mockResolvedValue(true);
      repoMock.update.mockResolvedValue(null);
      await expect(
        service.updateAssetModel({ id: "1", updatedBy: "u", ...validBody })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("returns the updated entity on success", async () => {
      repoMock.manufacturerExists.mockResolvedValue(true);
      const entity = { id: 1, ...validBody, createdBy: "u", updatedBy: "u" };
      repoMock.update.mockResolvedValue(entity);
      await expect(
        service.updateAssetModel({ id: "1", updatedBy: "u", ...validBody })
      ).resolves.toEqual(entity);
    });
  });

  describe("deleteAssetModel", () => {
    it("throws Internal when still referenced by a healthcare facility asset", async () => {
      repoMock.isReferencedByHealthcareFacilityAsset.mockResolvedValue(true);
      await expect(service.deleteAssetModel("1")).rejects.toBeInstanceOf(APIError);
      await expect(service.deleteAssetModel("1")).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.isReferencedByHealthcareFacilityAsset.mockResolvedValue(false);
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteAssetModel("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.isReferencedByHealthcareFacilityAsset.mockResolvedValue(false);
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteAssetModel("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
