import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndFacility: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));
vi.mock("./healthcare-asset.repository", () => repoMock);

import * as service from "./healthcare-asset.service";

const validCreateInput = {
  id: 1,
  healthcareFacilityId: 10,
  assetTypeName: "Waste Scale",
  assetWorkingStatusName: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("healthcare-asset.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createHealthcareAsset", () => {
    it("throws InvalidArgument on invalid body (e.g. missing healthcareFacilityId)", async () => {
      await expect(
        service.createHealthcareAsset({ ...validCreateInput, healthcareFacilityId: 0 })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("creates via repo on valid input", async () => {
      const entity = {
        id: 1,
        healthcareFacilityId: 10,
        assetId: null,
        assetTypeName: "Waste Scale",
        assetWorkingStatusName: "active",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repoMock.create.mockResolvedValue(entity);
      await expect(service.createHealthcareAsset(validCreateInput)).resolves.toEqual(entity);
      expect(repoMock.create).toHaveBeenCalled();
    });
  });

  describe("getHealthcareAssetById", () => {
    it("throws InvalidArgument when neither query healthcareFacilityId nor auth entityId is present", async () => {
      await expect(service.getHealthcareAssetById("1", undefined, 0, undefined)).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("throws FailedPrecondition when the local row is not found and no token is available for the remote lookup", async () => {
      repoMock.findByIdAndFacility.mockResolvedValue(null);
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getHealthcareAssetById("1", 10, 0, undefined)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Healthcare Asset not found",
      });
    });

    it("throws FailedPrecondition when the remote lookup fails, even if a local row exists (matches the original's real behavior)", async () => {
      const entity = {
        id: 1,
        healthcareFacilityId: 10,
        assetId: "AB123",
        assetTypeName: "Waste Scale",
        assetWorkingStatusName: "active",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repoMock.findByIdAndFacility.mockResolvedValue(entity);
      repoMock.findById.mockResolvedValue(entity);
      await expect(service.getHealthcareAssetById("1", 10, 0, undefined)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });
  });

  describe("updateHealthcareAsset", () => {
    it("throws a plain Error (not APIError) when id is missing/zero/NaN", async () => {
      await expect(service.updateHealthcareAsset({ id: "" }, undefined)).rejects.toThrow(
        "ID is required to update an asset model"
      );
      await expect(service.updateHealthcareAsset({ id: "" }, undefined)).rejects.not.toBeInstanceOf(APIError);
    });

    it("throws InvalidArgument on invalid body (assetId too short)", async () => {
      await expect(
        service.updateHealthcareAsset({ id: "1", assetId: "a" }, undefined)
      ).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("throws FailedPrecondition when the row does not exist locally and no token is available for the remote lookup", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.updateHealthcareAsset({ id: "1" }, undefined)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "HealthcareFacilityAsset not found",
      });
    });

    it("returns the updated entity on success", async () => {
      const existing = {
        id: 1,
        healthcareFacilityId: 10,
        assetId: "AB123",
        assetTypeName: "Waste Scale",
        assetWorkingStatusName: "active",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repoMock.findById.mockResolvedValue(existing);
      repoMock.update.mockResolvedValue({ ...existing, assetWorkingStatusName: "inactive" });
      await expect(
        service.updateHealthcareAsset({ id: "1", assetWorkingStatusName: "inactive" }, undefined)
      ).resolves.toMatchObject({ assetWorkingStatusName: "inactive" });
    });
  });
});
