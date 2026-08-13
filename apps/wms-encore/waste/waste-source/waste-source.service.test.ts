import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  checkDuplication: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateIsActive: vi.fn(),
  existsWasteBagByWasteSourceId: vi.fn(),
  existsWasteBagQrCodeByWasteSourceId: vi.fn(),
  existsQrCodeConfigByWasteSourceId: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./waste-source.repository", () => repoMock);

import * as service from "./waste-source.service";

const baseEntity = {
  id: 1,
  createdBy: "u",
  createdAt: new Date(),
  healthcareFacilityId: 10,
  sourceType: "INTERNAL",
  isActive: true,
  isResidue: true,
};

describe("waste-source.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWasteSourceById", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.getWasteSourceById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getWasteSourceById("abc")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getWasteSourceById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste source not found",
      });
    });

    it("returns the entity on success", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      await expect(service.getWasteSourceById("1")).resolves.toEqual(baseEntity);
    });
  });

  describe("createWasteSource", () => {
    it("throws InvalidArgument on invalid sourceType", async () => {
      await expect(
        service.createWasteSource({ createdBy: "u", entityId: 10, sourceType: "BOGUS" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws InvalidArgument when an internal-treatment duplicate exists", async () => {
      repoMock.checkDuplication.mockResolvedValue(false);
      await expect(
        service.createWasteSource({
          createdBy: "u",
          entityId: 10,
          sourceType: "INTERNAL_TREATMENT",
          internalTreatmentName: "PYROLYSIS",
        })
      ).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
        message: "Waste source with this internal treatment name already exists",
      });
    });

    it("defaults healthcareFacilityId to the auth entityId when not supplied", async () => {
      repoMock.create.mockResolvedValue(baseEntity);
      await service.createWasteSource({ createdBy: "u", entityId: 10, sourceType: "INTERNAL" });
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ healthcareFacilityId: 10 })
      );
    });
  });

  describe("updateWasteSource", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(
        service.updateWasteSource({ id: "", updatedBy: "u", sourceType: "INTERNAL" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(
        service.updateWasteSource({ id: "1", updatedBy: "u", sourceType: "INTERNAL" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("ignores the requested sourceType when the existing row is already INTERNAL_TREATMENT (original use-case bug, preserved)", async () => {
      repoMock.findById.mockResolvedValue({ ...baseEntity, sourceType: "INTERNAL_TREATMENT" });
      repoMock.checkDuplication.mockResolvedValue(true);
      repoMock.update.mockResolvedValue({ ...baseEntity, sourceType: "INTERNAL_TREATMENT" });

      await service.updateWasteSource({ id: "1", updatedBy: "u", sourceType: "EXTERNAL" });

      expect(repoMock.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ sourceType: "INTERNAL_TREATMENT" })
      );
    });

    it("applies the requested sourceType when the existing row is INTERNAL or EXTERNAL", async () => {
      repoMock.findById.mockResolvedValue({ ...baseEntity, sourceType: "INTERNAL" });
      repoMock.update.mockResolvedValue({ ...baseEntity, sourceType: "EXTERNAL" });

      await service.updateWasteSource({ id: "1", updatedBy: "u", sourceType: "EXTERNAL" });

      expect(repoMock.update).toHaveBeenCalledWith(1, expect.objectContaining({ sourceType: "EXTERNAL" }));
    });
  });

  describe("patchWasteSource", () => {
    it("throws InvalidArgument when is_active is missing", async () => {
      await expect(service.patchWasteSource("1", undefined)).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("throws InvalidArgument when the row does not exist", async () => {
      repoMock.updateIsActive.mockResolvedValue(null);
      await expect(service.patchWasteSource("1", "true")).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
        message: "Waste source not found",
      });
    });

    it("parses 'true'/'1' as active, anything else as inactive", async () => {
      repoMock.updateIsActive.mockResolvedValue(baseEntity);
      await service.patchWasteSource("1", "1");
      expect(repoMock.updateIsActive).toHaveBeenCalledWith(1, true);

      await service.patchWasteSource("1", "false");
      expect(repoMock.updateIsActive).toHaveBeenCalledWith(1, false);
    });
  });

  describe("deleteWasteSource", () => {
    it("throws InvalidArgument when associated with waste bags", async () => {
      repoMock.existsWasteBagByWasteSourceId.mockResolvedValue(true);
      await expect(service.deleteWasteSource("1")).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.existsWasteBagByWasteSourceId.mockResolvedValue(false);
      repoMock.existsWasteBagQrCodeByWasteSourceId.mockResolvedValue(false);
      repoMock.existsQrCodeConfigByWasteSourceId.mockResolvedValue(false);
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteWasteSource("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste source not found",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.existsWasteBagByWasteSourceId.mockResolvedValue(false);
      repoMock.existsWasteBagQrCodeByWasteSourceId.mockResolvedValue(false);
      repoMock.existsQrCodeConfigByWasteSourceId.mockResolvedValue(false);
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteWasteSource("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
