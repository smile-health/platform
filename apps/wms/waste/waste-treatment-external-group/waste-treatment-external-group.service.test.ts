import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  findGroupBagRows: vi.fn(),
  findClassificationIdsByRole: vi.fn(),
  findAllPaginated: vi.fn(),
}));
vi.mock("./waste-treatment-external-group.repository", () => repoMock);

import * as service from "./waste-treatment-external-group.service";

describe("waste-treatment-external-group.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWasteTreatmentExternalGroup", () => {
    it("throws FailedPrecondition (not NotFound) when no matching rows exist", async () => {
      repoMock.findGroupBagRows.mockResolvedValue([]);
      await expect(service.getWasteTreatmentExternalGroup({ id: 1 })).rejects.toMatchObject({
        code: ErrCode.FailedPrecondition,
        message: "waste.error.NOT_FOUND_WG",
      });
    });

    it("returns the group enriched with its bags and the joined transport-group fields", async () => {
      repoMock.findGroupBagRows.mockResolvedValue([
        {
          group: { id: 1, totalBagsCount: 2, totalWeightInKgs: 10, transportationStatus: "STORED_FOR_TREATMENT" },
          transporterOperatorId: "op-1",
          transporterVehicleId: 5,
          bag: {
            id: 10,
            wasteBagQrCodeId: "qr-1",
            wasteStatus: "STORED_FOR_TREATMENT",
            healthcareFacilityId: 1,
            wasteClassificationId: 3,
          },
        },
      ]);

      const result = await service.getWasteTreatmentExternalGroup({ id: 1 });
      expect(result.id).toBe(1);
      expect(result.transporterOperatorId).toBe("op-1");
      expect(result.transporterVehicleId).toBe(5);
      expect(result.wasteBags).toHaveLength(1);
      expect(result.wasteBags?.[0].wasteBagQrCodeId).toBe("qr-1");
      expect(repoMock.findGroupBagRows).toHaveBeenCalledWith({ groupId: 1, qrCodeId: undefined });
    });
  });

  describe("getAllWasteTreatmentExternalGroup", () => {
    it("defaults limit to 10 and page to 1 when absent/invalid", async () => {
      repoMock.findAllPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTreatmentExternalGroup({ limit: -5, page: 0 });
      expect(repoMock.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, page: 1 })
      );
    });

    it("passes the raw status string through unvalidated (mirrors the original's dead allow-list check)", async () => {
      repoMock.findAllPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTreatmentExternalGroup({ status: "TOTALLY_NOT_A_REAL_STATUS" });
      const call = repoMock.findAllPaginated.mock.calls[0][0];
      expect(call.wasteStatuses).toContain("TOTALLY_NOT_A_REAL_STATUS");
      // ...additively alongside the fixed default list, not exclusively.
      expect(call.wasteStatuses).toContain("READY_FOR_TREATMENT");
    });

    it("derives `roles` from externalPropertiesRoleType, gated on externalRoles (the original's two-field bug, preserved)", async () => {
      repoMock.findClassificationIdsByRole.mockResolvedValue([1, 2]);
      repoMock.findAllPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });

      await service.getAllWasteTreatmentExternalGroup({
        externalRoles: "operator_treatment",
        externalPropertiesRoleType: "operator_recycler",
      });

      // Gate passed (externalRoles is in the allow-list) -> role lookup uses
      // externalPropertiesRoleType's value ("operator_recycler"), NOT
      // externalRoles's value ("operator_treatment").
      expect(repoMock.findClassificationIdsByRole).toHaveBeenCalledWith("operator_recycler");
    });

    it("does not derive roles when externalRoles is not in the allow-list (e.g. operator_waste_bank)", async () => {
      repoMock.findAllPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTreatmentExternalGroup({
        externalRoles: "operator_waste_bank",
        externalPropertiesRoleType: "operator_waste_bank",
      });
      expect(repoMock.findClassificationIdsByRole).not.toHaveBeenCalled();
    });

    it("silently drops an invalid transportationStatus rather than throwing", async () => {
      repoMock.findAllPaginated.mockResolvedValue({ data: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } });
      await service.getAllWasteTreatmentExternalGroup({ transportationStatus: "NOT_REAL" });
      const call = repoMock.findAllPaginated.mock.calls[0][0];
      expect(call.transportationStatus).toBeUndefined();
    });

    it("maps repository rows into groups with providerName/consumerName from the first bag", async () => {
      repoMock.findAllPaginated.mockResolvedValue({
        data: [
          {
            group: { id: 1, totalBagsCount: 1, totalWeightInKgs: 5, transportationStatus: "STORED_FOR_TREATMENT" },
            bags: [{ id: 1, healthcareFacilityName: "HF-1", transporterName: "Transporter-1" }],
          },
        ],
        pagination: { total: 1, pages: 1, currentPage: 1, perPage: 10 },
      });

      const result = await service.getAllWasteTreatmentExternalGroup({});
      expect(result.data[0].consumerName).toBe("HF-1");
      expect(result.data[0].providerName).toBe("Transporter-1");
    });
  });
});
