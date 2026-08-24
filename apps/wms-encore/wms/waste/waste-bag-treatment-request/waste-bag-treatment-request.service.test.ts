import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  existsTreatmentGroup: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./waste-bag-treatment-request.repository", () => repoMock);

import * as service from "./waste-bag-treatment-request.service";

describe("waste-bag-treatment-request.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWasteBagTreatmentRequestById", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.getWasteBagTreatmentRequestById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getWasteBagTreatmentRequestById("abc")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getWasteBagTreatmentRequestById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste bag treatment request not found",
      });
    });

    it("returns the entity on success", async () => {
      const entity = { id: 1, treatmentGroupId: 5, createdBy: "u", createdAt: new Date() };
      repoMock.findById.mockResolvedValue(entity);
      await expect(service.getWasteBagTreatmentRequestById("1")).resolves.toEqual(entity);
    });
  });

  describe("createWasteBagTreatmentRequest", () => {
    it("throws InvalidArgument on invalid requestStatus", async () => {
      await expect(
        service.createWasteBagTreatmentRequest({
          createdBy: "u",
          requestStatus: "BOGUS",
          treatmentGroupId: 1,
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws InvalidArgument (422-equivalent) when the treatment group does not exist", async () => {
      repoMock.existsTreatmentGroup.mockResolvedValue(false);
      await expect(
        service.createWasteBagTreatmentRequest({
          createdBy: "u",
          requestStatus: "PENDING",
          treatmentGroupId: 42,
        })
      ).rejects.toMatchObject({
        code: ErrCode.InvalidArgument,
        message: "Waste bag treatment group with ID 42 not found",
      });
    });

    it("creates when the treatment group exists", async () => {
      repoMock.existsTreatmentGroup.mockResolvedValue(true);
      const entity = { id: 1, treatmentGroupId: 1, requestStatus: "PENDING", createdBy: "u", createdAt: new Date() };
      repoMock.create.mockResolvedValue(entity);
      const result = await service.createWasteBagTreatmentRequest({
        createdBy: "u",
        requestStatus: "PENDING",
        treatmentGroupId: 1,
      });
      expect(result).toEqual(entity);
      expect(repoMock.create).toHaveBeenCalledWith({
        createdBy: "u",
        requestStatus: "PENDING",
        treatmentGroupId: 1,
        requestCreatorId: undefined,
        requestApproverId: undefined,
      });
    });
  });

  describe("updateWasteBagTreatmentRequest", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(
        service.updateWasteBagTreatmentRequest({
          id: "",
          updatedBy: "u",
          requestStatus: "PENDING",
          treatmentGroupId: 1,
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(
        service.updateWasteBagTreatmentRequest({
          id: "1",
          updatedBy: "u",
          requestStatus: "PENDING",
          treatmentGroupId: 1,
        })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "Waste bag treatment request not found" });
    });

    it("throws InvalidArgument when the treatment group does not exist", async () => {
      repoMock.findById.mockResolvedValue({ id: 1, treatmentGroupId: 1, createdBy: "u", createdAt: new Date() });
      repoMock.existsTreatmentGroup.mockResolvedValue(false);
      await expect(
        service.updateWasteBagTreatmentRequest({
          id: "1",
          updatedBy: "u",
          requestStatus: "PENDING",
          treatmentGroupId: 99,
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("returns the updated entity on success", async () => {
      repoMock.findById.mockResolvedValue({ id: 1, treatmentGroupId: 1, createdBy: "u", createdAt: new Date() });
      repoMock.existsTreatmentGroup.mockResolvedValue(true);
      const entity = { id: 1, treatmentGroupId: 1, requestStatus: "ACCEPTED", createdBy: "u", createdAt: new Date() };
      repoMock.update.mockResolvedValue(entity);
      await expect(
        service.updateWasteBagTreatmentRequest({
          id: "1",
          updatedBy: "u",
          requestStatus: "ACCEPTED",
          treatmentGroupId: 1,
        })
      ).resolves.toEqual(entity);
    });
  });

  describe("deleteWasteBagTreatmentRequest", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteWasteBagTreatmentRequest("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteWasteBagTreatmentRequest("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste bag treatment request not found",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteWasteBagTreatmentRequest("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
