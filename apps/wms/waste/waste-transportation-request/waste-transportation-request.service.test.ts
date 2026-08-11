import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  transportationGroupExists: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./waste-transportation-request.repository", () => repoMock);

import * as service from "./waste-transportation-request.service";

describe("waste-transportation-request.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWasteTransportationRequestById", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(service.getWasteTransportationRequestById("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
      await expect(service.getWasteTransportationRequestById("abc")).rejects.toBeInstanceOf(APIError);
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getWasteTransportationRequestById("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste Transportation Request not found",
      });
    });

    it("returns the entity on success", async () => {
      const entity = {
        id: 1,
        createdBy: "u",
        createdAt: new Date(),
        transportationGroupId: 5,
      };
      repoMock.findById.mockResolvedValue(entity);
      await expect(service.getWasteTransportationRequestById("1")).resolves.toEqual(entity);
    });
  });

  describe("createWasteTransportationRequest", () => {
    it("throws InvalidArgument (422-equivalent) when transportationGroupId is missing", async () => {
      await expect(
        service.createWasteTransportationRequest({ createdBy: "u", transportationGroupId: undefined as unknown as number })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws InvalidArgument when the transportation group does not exist", async () => {
      repoMock.transportationGroupExists.mockResolvedValue(false);
      await expect(
        service.createWasteTransportationRequest({ createdBy: "u", transportationGroupId: 5 })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("creates with updatedBy defaulted to createdBy", async () => {
      repoMock.transportationGroupExists.mockResolvedValue(true);
      const entity = { id: 1, createdBy: "u", createdAt: new Date(), transportationGroupId: 5 };
      repoMock.create.mockResolvedValue(entity);
      const result = await service.createWasteTransportationRequest({ createdBy: "u", transportationGroupId: 5 });
      expect(result).toEqual(entity);
      expect(repoMock.create).toHaveBeenCalledWith({
        createdBy: "u",
        requestStatus: undefined,
        transportationGroupId: 5,
        requestCreatorId: undefined,
        requestApproverId: undefined,
      });
    });
  });

  describe("updateWasteTransportationRequest", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(
        service.updateWasteTransportationRequest({ id: "", updatedBy: "u", transportationGroupId: 5 })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(
        service.updateWasteTransportationRequest({ id: "1", updatedBy: "u", transportationGroupId: 5 })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "Waste Transportation Request not found" });
    });

    it("throws InvalidArgument when the transportation group does not exist", async () => {
      repoMock.findById.mockResolvedValue({ id: 1, transportationGroupId: 5, createdAt: new Date(), createdBy: "u" });
      repoMock.transportationGroupExists.mockResolvedValue(false);
      await expect(
        service.updateWasteTransportationRequest({ id: "1", updatedBy: "u", transportationGroupId: 5 })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("returns the updated entity on success", async () => {
      const existing = { id: 1, transportationGroupId: 5, createdAt: new Date(), createdBy: "u" };
      const updated = { ...existing, requestStatus: "ACCEPTED" };
      repoMock.findById.mockResolvedValue(existing);
      repoMock.transportationGroupExists.mockResolvedValue(true);
      repoMock.update.mockResolvedValue(updated);
      await expect(
        service.updateWasteTransportationRequest({ id: "1", updatedBy: "u", transportationGroupId: 5, requestStatus: "ACCEPTED" })
      ).resolves.toEqual(updated);
    });
  });

  describe("deleteWasteTransportationRequest", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteWasteTransportationRequest("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteWasteTransportationRequest("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste Transportation Request not found",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteWasteTransportationRequest("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
