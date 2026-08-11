import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findByIdWithWasteBags: vi.fn(),
  findAllPaginated: vi.fn(),
  findPending: vi.fn(),
}));
vi.mock("./waste-bag-treatment-group.repository", () => repoMock);

import * as service from "./waste-bag-treatment-group.service";

describe("waste-bag-treatment-group.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllWasteBagTreatmentGroup", () => {
    it("defaults limit/page and drops an unrecognized status silently", async () => {
      repoMock.findAllPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getAllWasteBagTreatmentGroup({ status: "NOT_A_REAL_STATUS" });
      expect(repoMock.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, page: 1, status: undefined })
      );
    });

    it("falls back to authEntityId when entityId isn't provided", async () => {
      repoMock.findAllPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getAllWasteBagTreatmentGroup({ authEntityId: 42 });
      expect(repoMock.findAllPaginated).toHaveBeenCalledWith(expect.objectContaining({ entityId: 42 }));
    });

    it("wraps repository errors as Internal (mirrors res.error(...) -> 500)", async () => {
      repoMock.findAllPaginated.mockRejectedValue(new Error("boom"));
      await expect(service.getAllWasteBagTreatmentGroup({})).rejects.toMatchObject({
        code: ErrCode.Internal,
      });
    });
  });

  describe("getWasteBagTreatmentGroup", () => {
    it("throws FailedPrecondition (not NotFound) when no group is found", async () => {
      repoMock.findByIdWithWasteBags.mockResolvedValue(null);
      await expect(
        service.getWasteBagTreatmentGroup({ id: "1", token: "t" })
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition, message: "waste.error.NOT_FOUND_WG" });
    });

    it("passes an undefined numeric id through when id is missing/NaN (matches the original's falsy-id passthrough)", async () => {
      repoMock.findByIdWithWasteBags.mockResolvedValue(null);
      await expect(
        service.getWasteBagTreatmentGroup({ token: "t" })
      ).rejects.toBeInstanceOf(APIError);
      expect(repoMock.findByIdWithWasteBags).toHaveBeenCalledWith({ id: undefined, qrCodeId: undefined });
    });

    it("returns the group with raw (unenriched) waste bag rows on success", async () => {
      const group = { id: 1, totalBagsCount: 2, totalWeightInKgs: 10, treatmentStatus: "IN_TEMPORARY_STORAGE" };
      repoMock.findByIdWithWasteBags.mockResolvedValue({ group, wasteBagRows: [{ id: 5 }] });
      await expect(service.getWasteBagTreatmentGroup({ id: "1", token: "t" })).resolves.toEqual({
        ...group,
        wasteBags: [{ id: 5 }],
      });
    });
  });

  describe("getPendingWasteTreatmentGroups", () => {
    it("throws FailedPrecondition when neither entityId nor authEntityId resolve", async () => {
      await expect(service.getPendingWasteTreatmentGroups({})).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("uses authEntityId as the healthcareFacilityId fallback", async () => {
      repoMock.findPending.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getPendingWasteTreatmentGroups({ authEntityId: 7 });
      expect(repoMock.findPending).toHaveBeenCalledWith({ limit: 10, page: 1, healthcareFacilityId: 7 });
    });

    it("wraps repository errors as Internal", async () => {
      repoMock.findPending.mockRejectedValue(new Error("boom"));
      await expect(service.getPendingWasteTreatmentGroups({ entityId: 1 })).rejects.toMatchObject({
        code: ErrCode.Internal,
      });
    });
  });
});
