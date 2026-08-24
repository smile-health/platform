import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock("./waste-transportation-group.repository", () => repoMock);

import * as service from "./waste-transportation-group.service";

const baseEntity = {
  id: 1,
  createdBy: "u",
  totalBagsCount: 3,
  totalWeightInKgs: 10,
  transportationStatus: "READY_FOR_TRANSPORT",
};

describe("waste-transportation-group.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllWasteTransportationGroups", () => {
    it("clamps limit/page to defaults and drops unrecognized status", async () => {
      repoMock.findPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getAllWasteTransportationGroups({ status: "NOT_A_REAL_STATUS" });
      expect(repoMock.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, page: 1, status: undefined })
      );
    });

    it("passes through a recognized status", async () => {
      repoMock.findPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getAllWasteTransportationGroups({ status: "IN_TRANSIT" });
      expect(repoMock.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ status: "IN_TRANSIT" })
      );
    });
  });

  describe("createWasteTransportationGroup", () => {
    it("throws InvalidArgument on malformed body (e.g. empty wasteBagIds)", async () => {
      await expect(
        service.createWasteTransportationGroup({
          createdBy: "u",
          wasteBagIds: [],
          totalBagsCount: 1,
          totalWeightInKgs: 1,
          transportationStatus: "GENERATED",
        })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("creates on valid body", async () => {
      repoMock.create.mockResolvedValue(baseEntity);
      const result = await service.createWasteTransportationGroup({
        createdBy: "u",
        wasteBagIds: [1, 2, 3],
        totalBagsCount: 3,
        totalWeightInKgs: 10,
        transportationStatus: "GENERATED",
      });
      expect(result).toEqual(baseEntity);
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: "u", totalBagsCount: 3, totalWeightInKgs: 10 })
      );
    });
  });

  describe("getWasteTransportationGroupById", () => {
    it("throws InvalidArgument when the Authorization header is missing/malformed", async () => {
      await expect(
        service.getWasteTransportationGroupById({ id: "1", authorization: undefined })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
      await expect(
        service.getWasteTransportationGroupById({ id: "1", authorization: "not-bearer" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws FailedPrecondition when id is missing", async () => {
      await expect(
        service.getWasteTransportationGroupById({ authorization: "Bearer t" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(
        service.getWasteTransportationGroupById({ id: "1", authorization: "Bearer t" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "Waste source not found" });
    });

    it("returns the entity on success", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      await expect(
        service.getWasteTransportationGroupById({ id: "1", authorization: "Bearer t" })
      ).resolves.toEqual(baseEntity);
    });
  });

  describe("updateWasteTransportationGroup", () => {
    it("throws FailedPrecondition when id is missing/NaN", async () => {
      await expect(
        service.updateWasteTransportationGroup({ id: "", updatedBy: "u" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws FailedPrecondition when the row does not exist", async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(
        service.updateWasteTransportationGroup({ id: "1", updatedBy: "u" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "Waste source not found" });
    });

    it("returns the updated entity, defaulting fields from the existing row", async () => {
      repoMock.findById.mockResolvedValue(baseEntity);
      repoMock.update.mockResolvedValue({ ...baseEntity, transportationStatus: "TRANSPORTATION_REQUEST_CREATED" });
      const result = await service.updateWasteTransportationGroup({
        id: "1",
        updatedBy: "u",
        transportationStatus: "TRANSPORTATION_REQUEST_CREATED",
      });
      expect(result.transportationStatus).toBe("TRANSPORTATION_REQUEST_CREATED");
      expect(repoMock.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ updatedBy: "u", totalWeightInKgs: baseEntity.totalWeightInKgs })
      );
    });
  });

  describe("deleteWasteTransportationGroup", () => {
    it("throws FailedPrecondition when id is empty", async () => {
      await expect(service.deleteWasteTransportationGroup("")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.softDelete.mockResolvedValue(false);
      await expect(service.deleteWasteTransportationGroup("1")).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "Waste source not found",
      });
    });

    it("returns true on successful delete", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(service.deleteWasteTransportationGroup("1", 42)).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, 42);
    });
  });
});
