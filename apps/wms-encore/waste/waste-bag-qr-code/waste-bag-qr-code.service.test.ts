import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findByQrCode: vi.fn(),
  findWasteBagByQrCode: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  findByIds: vi.fn(),
  updateById: vi.fn(),
  findById: vi.fn(),
  softDeleteById: vi.fn(),
  existingWasteSourceIds: vi.fn(),
  existingWasteClassificationIds: vi.fn(),
}));
vi.mock("./waste-bag-qr-code.repository", () => repoMock);

import * as service from "./waste-bag-qr-code.service";

describe("waste-bag-qr-code.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repoMock.findWasteBagByQrCode.mockResolvedValue(null);
  });

  describe("getWasteBagQrCodeById", () => {
    it("throws FailedPrecondition when qrCode is missing", async () => {
      await expect(service.getWasteBagQrCodeById("", 1)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "ID parameter is required",
      });
    });

    it("throws FailedPrecondition when entityId is missing", async () => {
      await expect(service.getWasteBagQrCodeById("0001010820260", 0)).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "entityId is required",
      });
    });

    it("throws InvalidArgument ALREADY_REGISTERED when the qr is already registered with no decay day", async () => {
      repoMock.findWasteBagByQrCode.mockResolvedValue({
        scheduledStorageEndDatetime: null,
        minimunDecayDay: null,
      });
      await expect(service.getWasteBagQrCodeById("q1", 1)).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
        message: "ALREADY_REGISTERED",
      });
    });

    it("throws InvalidArgument (422, not FailedPrecondition) when the row is not found", async () => {
      repoMock.findByQrCode.mockResolvedValue(null);
      await expect(service.getWasteBagQrCodeById("q1", 1)).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
        message: "NOT_FOUND",
      });
    });

    it("returns the entity on success", async () => {
      const entity = { id: 1, qrCode: "q1", healthcareFacilityId: 1 };
      repoMock.findByQrCode.mockResolvedValue(entity);
      await expect(service.getWasteBagQrCodeById("q1", 1)).resolves.toEqual(entity);
    });
  });

  describe("createWasteBagQrCode", () => {
    it("throws InvalidArgument on empty items", async () => {
      await expect(service.createWasteBagQrCode([], "u")).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
      });
    });

    it("throws InvalidArgument NOT_FOUND_WS when wasteSourceId doesn't exist", async () => {
      repoMock.existingWasteSourceIds.mockResolvedValue(new Set());
      repoMock.existingWasteClassificationIds.mockResolvedValue(new Set([1]));
      await expect(
        service.createWasteBagQrCode(
          [{ wasteSourceId: 5, wasteClassificationId: 1, labelCount: 1 }],
          "u"
        )
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument, message: "NOT_FOUND_WS" });
    });

    it("creates labelCount rows and returns them via findByIds", async () => {
      repoMock.existingWasteSourceIds.mockResolvedValue(new Set([5]));
      repoMock.existingWasteClassificationIds.mockResolvedValue(new Set([1]));
      repoMock.create.mockResolvedValueOnce({ id: 10 }).mockResolvedValueOnce({ id: 11 });
      const result = [{ id: 10, qrCode: "a" }, { id: 11, qrCode: "b" }];
      repoMock.findByIds.mockResolvedValue(result);

      await expect(
        service.createWasteBagQrCode(
          [{ wasteSourceId: 5, wasteClassificationId: 1, labelCount: 2 }],
          "u"
        )
      ).resolves.toEqual(result);
      expect(repoMock.create).toHaveBeenCalledTimes(2);
      expect(repoMock.findByIds).toHaveBeenCalledWith([10, 11]);
    });
  });

  describe("updateWasteBagQrCode", () => {
    it("throws FailedPrecondition when id is missing", async () => {
      await expect(
        service.updateWasteBagQrCode({ id: "", healthcareFacilityId: 1, qrCode: "q" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "ID parameter is required" });
    });

    it("throws FailedPrecondition (matching the original's real null path) when not found", async () => {
      repoMock.findByQrCode.mockResolvedValue(null);
      await expect(
        service.updateWasteBagQrCode({ id: "q1", healthcareFacilityId: 1, qrCode: "q2" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "WasteBagQrCode not found" });
    });

    it("throws a documented-deviation 400 instead of crashing when wasteSourceId is omitted", async () => {
      repoMock.findByQrCode.mockResolvedValue({ id: 1, qrCode: "q1", healthcareFacilityId: 1 });
      await expect(
        service.updateWasteBagQrCode({ id: "q1", healthcareFacilityId: 1, qrCode: "q2" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws InvalidArgument when wasteSourceId doesn't exist", async () => {
      repoMock.findByQrCode.mockResolvedValue({ id: 1, qrCode: "q1", healthcareFacilityId: 1 });
      repoMock.existingWasteSourceIds.mockResolvedValue(new Set());
      repoMock.existingWasteClassificationIds.mockResolvedValue(new Set([2]));
      await expect(
        service.updateWasteBagQrCode({
          id: "q1",
          healthcareFacilityId: 1,
          wasteSourceId: 5,
          wasteClassificationId: 2,
          qrCode: "q2",
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument, message: "Qr Code Config with ID 5 not found" });
    });

    it("updates and returns the merged entity on success", async () => {
      repoMock.findByQrCode.mockResolvedValue({ id: 1, qrCode: "q1", healthcareFacilityId: 1 });
      repoMock.existingWasteSourceIds.mockResolvedValue(new Set([5]));
      repoMock.existingWasteClassificationIds.mockResolvedValue(new Set([2]));

      const result = await service.updateWasteBagQrCode({
        id: "q1",
        healthcareFacilityId: 1,
        wasteSourceId: 5,
        wasteClassificationId: 2,
        qrCode: "q2",
      });
      expect(result.qrCode).toBe("q2");
      expect(repoMock.updateById).toHaveBeenCalledWith(1, {
        healthcareFacilityId: 1,
        wasteSourceId: 5,
        wasteClassificationId: 2,
        qrCode: "q2",
      });
    });
  });

  describe("deleteWasteBagQrCode", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteWasteBagQrCode("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition (documented deviation from the original's false-success bug) when not found", async () => {
      repoMock.softDeleteById.mockResolvedValue(false);
      await expect(service.deleteWasteBagQrCode("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "NOT_FOUND",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.softDeleteById.mockResolvedValue(true);
      await expect(service.deleteWasteBagQrCode("1", 42)).resolves.toBe(true);
      expect(repoMock.softDeleteById).toHaveBeenCalledWith(1, 42);
    });
  });
});
