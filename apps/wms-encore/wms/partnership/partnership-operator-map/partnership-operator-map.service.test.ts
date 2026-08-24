import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findByCondition: vi.fn(),
  existsPartnership: vi.fn(),
  create: vi.fn(),
  findAllPaginated: vi.fn(),
  findAllByThirdpartyAdmin: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  findDistinctOperatorIdsByProviderEntity: vi.fn(),
}));
vi.mock("./partnership-operator-map.repository", () => repoMock);

import * as service from "./partnership-operator-map.service";

describe("partnership-operator-map.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPartnershipOperatorMap", () => {
    it("throws InvalidArgument on invalid body", async () => {
      await expect(
        service.createPartnershipOperatorMap({ partnershipId: -1, operatorId: "op-1" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("throws Internal when the (partnershipId, operatorId) pair already exists", async () => {
      repoMock.findByCondition.mockResolvedValue({ partnershipId: 1, operatorId: "op-1" });
      await expect(
        service.createPartnershipOperatorMap({ partnershipId: 1, operatorId: "op-1" })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("throws InvalidArgument when the referenced partnership does not exist", async () => {
      repoMock.findByCondition.mockResolvedValue(null);
      repoMock.existsPartnership.mockResolvedValue(false);
      await expect(
        service.createPartnershipOperatorMap({ partnershipId: 1, operatorId: "op-1" })
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("creates and returns the map on success", async () => {
      repoMock.findByCondition.mockResolvedValue(null);
      repoMock.existsPartnership.mockResolvedValue(true);
      const result = await service.createPartnershipOperatorMap({ partnershipId: 1, operatorId: "op-1" });
      expect(result).toEqual({ partnershipId: 1, operatorId: "op-1" });
      expect(repoMock.create).toHaveBeenCalledWith(1, "op-1");
    });
  });

  describe("getAllPartnershipOperatorMaps", () => {
    it("throws FailedPrecondition when providerId is missing", async () => {
      await expect(service.getAllPartnershipOperatorMaps({})).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("falls back to authEntityId when search is not supplied", async () => {
      repoMock.findAllPaginated.mockResolvedValue({
        data: [],
        pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 },
      });
      await service.getAllPartnershipOperatorMaps({ providerId: 5, authEntityId: "42" });
      expect(repoMock.findAllPaginated).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        providerId: 5,
        healthcareFacilityId: 42,
      });
    });
  });

  describe("updatePartnershipOperatorMap", () => {
    it("throws FailedPrecondition when partnership_id/operator_id query params are missing", async () => {
      await expect(
        service.updatePartnershipOperatorMap({ partnershipId: 1, operatorId: "op-1" } as any)
      ).rejects.toMatchObject({ code: ErrCode.FailedPrecondition });
    });

    it("throws Internal when the new pair already exists", async () => {
      repoMock.findByCondition.mockResolvedValueOnce({ partnershipId: 2, operatorId: "op-2" });
      await expect(
        service.updatePartnershipOperatorMap({
          partnership_id: "1",
          operator_id: "op-1",
          partnershipId: 2,
          operatorId: "op-2",
        })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("throws Internal when the old row does not exist", async () => {
      repoMock.findByCondition.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      await expect(
        service.updatePartnershipOperatorMap({
          partnership_id: "1",
          operator_id: "op-1",
          partnershipId: 2,
          operatorId: "op-2",
        })
      ).rejects.toMatchObject({ code: ErrCode.Internal });
    });

    it("updates and returns the map on success", async () => {
      repoMock.findByCondition.mockResolvedValueOnce(null).mockResolvedValueOnce({
        partnershipId: 1,
        operatorId: "op-1",
      });
      repoMock.update.mockResolvedValue({ partnershipId: 2, operatorId: "op-2" });
      const result = await service.updatePartnershipOperatorMap({
        partnership_id: "1",
        operator_id: "op-1",
        partnershipId: 2,
        operatorId: "op-2",
      });
      expect(result).toEqual({ partnershipId: 2, operatorId: "op-2" });
      expect(repoMock.update).toHaveBeenCalledWith(1, "op-1", 2, "op-2");
    });
  });

  describe("deletePartnershipOperatorMap", () => {
    it("throws FailedPrecondition when partnershipId/operatorId are missing", async () => {
      await expect(service.deletePartnershipOperatorMap({})).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
      });
    });

    it("throws FailedPrecondition when nothing was deleted", async () => {
      repoMock.softDelete.mockResolvedValue(false);
      await expect(
        service.deletePartnershipOperatorMap({ partnershipId: "1", operatorId: "op-1" })
      ).rejects.toBeInstanceOf(APIError);
    });

    it("returns true on successful delete", async () => {
      repoMock.softDelete.mockResolvedValue(true);
      await expect(
        service.deletePartnershipOperatorMap({ partnershipId: "1", operatorId: "op-1", deletedBy: 42 })
      ).resolves.toBe(true);
      expect(repoMock.softDelete).toHaveBeenCalledWith(1, "op-1", 42);
    });
  });

  describe("getOperatorsFromOperatorMap", () => {
    it("returns operators with operatorName left undefined (cross-service lookup not ported)", async () => {
      repoMock.findDistinctOperatorIdsByProviderEntity.mockResolvedValue(["op-1", "op-2"]);
      const result = await service.getOperatorsFromOperatorMap({ entityId: 5 });
      expect(result).toEqual([{ operatorId: "op-1" }, { operatorId: "op-2" }]);
    });
  });
});
