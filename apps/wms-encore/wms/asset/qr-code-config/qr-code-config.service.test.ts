import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./qr-code-config.repository", () => repoMock);

import * as service from "./qr-code-config.service";

describe("qr-code-config.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getQrCodeConfigById", () => {
    it("throws FailedPrecondition when id is missing", async () => {
      await expect(service.getQrCodeConfigById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "ID parameter is required",
      });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getQrCodeConfigById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Qr Code Config not found",
      });
    });

    it("returns the entity on success", async () => {
      const entity = {
        id: 1,
        healthcareFacilityId: 1,
        wasteSourceId: 2,
        wasteClassificationId: 3,
        labelCount: 10,
        createdBy: "u",
        createdAt: new Date(),
      };
      repoMock.findById.mockResolvedValue(entity);
      await expect(service.getQrCodeConfigById("1")).resolves.toEqual(entity);
    });
  });

  describe("createQrCodeConfig", () => {
    it("throws InvalidArgument (422-equivalent) on invalid body", async () => {
      await expect(
        service.createQrCodeConfig({
          createdBy: "u",
          healthcareFacilityId: 1,
          wasteSourceId: -1,
          wasteClassificationId: 1,
          labelCount: 1,
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("creates with updatedBy defaulted to createdBy", async () => {
      const entity = {
        id: 1,
        healthcareFacilityId: 1,
        wasteSourceId: 2,
        wasteClassificationId: 3,
        labelCount: 10,
        createdBy: "u",
        createdAt: new Date(),
      };
      repoMock.create.mockResolvedValue(entity);
      const result = await service.createQrCodeConfig({
        createdBy: "u",
        healthcareFacilityId: 1,
        wasteSourceId: 2,
        wasteClassificationId: 3,
        labelCount: 10,
      });
      expect(result).toEqual(entity);
      expect(repoMock.create).toHaveBeenCalledWith({
        createdBy: "u",
        healthcareFacilityId: 1,
        wasteSourceId: 2,
        wasteClassificationId: 3,
        labelCount: 10,
      });
    });
  });

  describe("updateQrCodeConfig", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(
        service.updateQrCodeConfig({
          id: "",
          updatedBy: "u",
          healthcareFacilityId: 1,
          wasteSourceId: 1,
          wasteClassificationId: 1,
          labelCount: 1,
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws InvalidArgument on invalid body", async () => {
      await expect(
        service.updateQrCodeConfig({
          id: "1",
          updatedBy: "u",
          healthcareFacilityId: 1,
          wasteSourceId: -1,
          wasteClassificationId: 1,
          labelCount: 1,
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.update.mockResolvedValue(null);
      await expect(
        service.updateQrCodeConfig({
          id: "1",
          updatedBy: "u",
          healthcareFacilityId: 1,
          wasteSourceId: 1,
          wasteClassificationId: 1,
          labelCount: 1,
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "Qr Code Config not found" });
    });

    it("returns the updated entity on success", async () => {
      const entity = {
        id: 1,
        healthcareFacilityId: 1,
        wasteSourceId: 1,
        wasteClassificationId: 1,
        labelCount: 1,
        createdBy: "u",
        createdAt: new Date(),
      };
      repoMock.update.mockResolvedValue(entity);
      await expect(
        service.updateQrCodeConfig({
          id: "1",
          updatedBy: "u",
          healthcareFacilityId: 1,
          wasteSourceId: 1,
          wasteClassificationId: 1,
          labelCount: 1,
        })
      ).resolves.toEqual(entity);
    });
  });

  describe("deleteQrCodeConfig", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteQrCodeConfig("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "ID parameter is required",
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteQrCodeConfig("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Qr Code Config not found",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteQrCodeConfig("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
