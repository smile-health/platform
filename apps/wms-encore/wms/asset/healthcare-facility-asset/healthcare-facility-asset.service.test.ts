import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findAssetModelExists: vi.fn(),
  findAllPaginated: vi.fn(),
  findAllByEntityId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateIotEnable: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./healthcare-facility-asset.repository", () => repoMock);

import * as service from "./healthcare-facility-asset.service";

const baseAsset = {
  id: 1,
  createdBy: "u",
  updatedBy: "u",
  assetStatus: "OPERATIONAL",
  healthcareFacilityId: 10,
  assetId: "AST-001",
  modelId: 5,
  isIotEnable: false,
  createdAt: new Date(),
};

describe("healthcare-facility-asset.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHealthcareFacilityAssetById", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.getHealthcareFacilityAssetById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getHealthcareFacilityAssetById("abc")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getHealthcareFacilityAssetById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "HealthcareFacilityAsset not found",
      });
    });

    it("returns the entity on success", async () => {
      repoMock.findById.mockResolvedValue(baseAsset);
      await expect(service.getHealthcareFacilityAssetById("1")).resolves.toEqual(baseAsset);
    });
  });

  describe("createHealthcareFacilityAsset", () => {
    it("throws FailedPrecondition when healthcareFacilityId is missing", async () => {
      await expect(
        service.createHealthcareFacilityAsset({
          createdBy: "u",
          assetStatus: "OPERATIONAL",
          assetId: "AST-001",
          modelId: 5,
          isIotEnable: false,
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws InvalidArgument on invalid assetStatus", async () => {
      await expect(
        service.createHealthcareFacilityAsset({
          createdBy: "u",
          healthcareFacilityId: 10,
          assetStatus: "NOT_A_STATUS",
          assetId: "AST-001",
          modelId: 5,
          isIotEnable: false,
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws InvalidArgument (422-equivalent) when the asset model doesn't exist", async () => {
      repoMock.findAssetModelExists.mockResolvedValue(false);
      await expect(
        service.createHealthcareFacilityAsset({
          createdBy: "u",
          healthcareFacilityId: 10,
          assetStatus: "OPERATIONAL",
          assetId: "AST-001",
          modelId: 5,
          isIotEnable: false,
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument, message: "Asset model with ID 5 not found" });
    });

    it("creates when the asset model exists", async () => {
      repoMock.findAssetModelExists.mockResolvedValue(true);
      repoMock.create.mockResolvedValue(baseAsset);
      const result = await service.createHealthcareFacilityAsset({
        createdBy: "u",
        healthcareFacilityId: 10,
        assetStatus: "OPERATIONAL",
        assetId: "AST-001",
        modelId: 5,
        isIotEnable: false,
      });
      expect(result).toEqual(baseAsset);
    });
  });

  describe("updateHealthcareFacilityAsset", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(
        service.updateHealthcareFacilityAsset({
          id: "",
          updatedBy: "u",
          assetStatus: "OPERATIONAL",
          assetId: "AST-001",
          modelId: 5,
          isIotEnable: false,
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws InvalidArgument when the asset model doesn't exist", async () => {
      repoMock.findAssetModelExists.mockResolvedValue(false);
      await expect(
        service.updateHealthcareFacilityAsset({
          id: "1",
          updatedBy: "u",
          assetStatus: "OPERATIONAL",
          assetId: "AST-001",
          modelId: 5,
          isIotEnable: false,
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findAssetModelExists.mockResolvedValue(true);
      repoMock.update.mockResolvedValue(null);
      await expect(
        service.updateHealthcareFacilityAsset({
          id: "1",
          updatedBy: "u",
          assetStatus: "OPERATIONAL",
          assetId: "AST-001",
          modelId: 5,
          isIotEnable: false,
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("returns the updated entity on success", async () => {
      repoMock.findAssetModelExists.mockResolvedValue(true);
      repoMock.update.mockResolvedValue(baseAsset);
      await expect(
        service.updateHealthcareFacilityAsset({
          id: "1",
          updatedBy: "u",
          assetStatus: "OPERATIONAL",
          assetId: "AST-001",
          modelId: 5,
          isIotEnable: false,
        })
      ).resolves.toEqual(baseAsset);
    });
  });

  describe("patchHealthcareFacilityAsset", () => {
    it("throws InvalidArgument when is_iot_enable query param is missing", async () => {
      await expect(service.patchHealthcareFacilityAsset({ id: "1" })).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(
        service.patchHealthcareFacilityAsset({ id: "", is_iot_enable: "true" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.updateIotEnable.mockResolvedValue(null);
      await expect(
        service.patchHealthcareFacilityAsset({ id: "1", is_iot_enable: "true" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("parses '1' and 'true' as enabled, everything else as disabled", async () => {
      repoMock.updateIotEnable.mockResolvedValue(baseAsset);
      await service.patchHealthcareFacilityAsset({ id: "1", is_iot_enable: "1" });
      expect(repoMock.updateIotEnable).toHaveBeenCalledWith(1, true);

      await service.patchHealthcareFacilityAsset({ id: "1", is_iot_enable: "yes" });
      expect(repoMock.updateIotEnable).toHaveBeenCalledWith(1, false);
    });
  });

  describe("deleteHealthcareFacilityAsset", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.deleteHealthcareFacilityAsset("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteHealthcareFacilityAsset("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "HealthcareFacilityAsset not found",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteHealthcareFacilityAsset("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
