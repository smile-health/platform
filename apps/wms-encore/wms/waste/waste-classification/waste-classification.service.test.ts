import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findByWasteCharacteristicsId: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deactivate: vi.fn(),
  getOneRegionId: vi.fn(),
  wasteHierarchyExists: vi.fn(),
}));
vi.mock("./waste-classification.repository", () => repoMock);

import * as service from "./waste-classification.service";

const baseEntity = {
  id: 1,
  createdAt: new Date(),
  createdBy: "u",
  regionId: 1,
  effectiveFrom: new Date(),
  effectiveTo: new Date(9999, 11, 30),
  wasteTypeId: 1,
  wasteGroupId: 2,
  wasteCharacteristicsId: 3,
  wasteCode: "WC-1",
  wasteBagColorCode: "BLACK",
  useColdStorage: false,
  allowHealthcareFacilityTreatment: true,
  isActive: true,
  hasMultipleTransporters: false,
  disposalMethod: "INCINERATION",
};

describe("waste-classification.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repoMock.wasteHierarchyExists.mockResolvedValue(true);
    repoMock.getOneRegionId.mockResolvedValue(1);
    repoMock.findByWasteCharacteristicsId.mockResolvedValue(null);
  });

  describe("getWasteClassificationById", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.getWasteClassificationById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition (message preserved verbatim) when not found", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getWasteClassificationById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste source group not found",
      });
    });

    it("returns the entity on success", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      await expect(service.getWasteClassificationById("1")).resolves.toEqual(baseEntity);
    });
  });

  describe("createWasteClassification", () => {
    const validInput = {
      createdBy: "u",
      wasteTypeId: 1,
      wasteGroupId: 2,
      wasteCharacteristicsId: 3,
      wasteCode: "WC-1",
      wasteBagColorCode: "BLACK",
      useColdStorage: false,
      allowHealthcareFacilityTreatment: true,
      hasMultipleTransporters: false,
      disposalMethod: "INCINERATION",
    };

    it("throws InvalidArgument (422-equivalent) on schema failure", async () => {
      await expect(
        service.createWasteClassification({ ...validInput, wasteCode: "" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws Internal when no region exists at all, even though regionId is irrelevant here", async () => {
      repoMock.getOneRegionId.mockResolvedValue(null);
      await expect(service.createWasteClassification(validInput)).rejects.toMatchObject({
        code: ErrCode.Internal,
        message: "Region not found",
      });
    });

    it("throws Internal when a hierarchy id does not exist", async () => {
      repoMock.wasteHierarchyExists.mockResolvedValueOnce(false);
      await expect(service.createWasteClassification(validInput)).rejects.toMatchObject({
        code: ErrCode.Internal,
      });
    });

    it("throws Internal when the waste characteristic is already configured", async () => {
      repoMock.findByWasteCharacteristicsId.mockResolvedValue(baseEntity);
      await expect(service.createWasteClassification(validInput)).rejects.toMatchObject({
        code: ErrCode.Internal,
      });
    });

    it("throws Internal when hierarchy ids collide", async () => {
      await expect(
        service.createWasteClassification({ ...validInput, wasteGroupId: 1 })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("creates successfully, defaulting isActive to false", async () => {
      repoMock.create.mockResolvedValue(baseEntity);
      const result = await service.createWasteClassification(validInput);
      expect(result).toEqual(baseEntity);
      expect(repoMock.create).toHaveBeenCalledWith(expect.objectContaining({ isActive: false, regionId: 1 }));
    });
  });

  describe("updateWasteClassification", () => {
    const validInput = {
      id: "1",
      updatedBy: "u",
      wasteTypeId: 1,
      wasteGroupId: 2,
      wasteCharacteristicsId: 3,
      wasteCode: "WC-1",
      wasteBagColorCode: "BLACK",
      useColdStorage: false,
      allowHealthcareFacilityTreatment: true,
      hasMultipleTransporters: false,
      disposalMethod: "INCINERATION",
    };

    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.updateWasteClassification({ ...validInput, id: "" })).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.updateWasteClassification(validInput)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste source group not found",
      });
    });

    it("returns the updated entity on success", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      repoMock.update.mockResolvedValue(baseEntity);
      await expect(service.updateWasteClassification(validInput)).resolves.toEqual(baseEntity);
    });
  });

  describe("deleteWasteClassification", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteWasteClassification("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.deleteWasteClassification("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste classification not found",
      });
    });

    it("deactivates (is_active=false) rather than truly soft-deleting, on success", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      repoMock.deactivate.mockResolvedValue(true);
      await expect(service.deleteWasteClassification("1")).resolves.toBe(true);
      expect(repoMock.deactivate).toHaveBeenCalledWith(1);
    });
  });
});
