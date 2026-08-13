import { beforeEach, describe, expect, it, vi } from "vitest";
import { APIError, ErrCode } from "encore.dev/api";

const repoMock = vi.hoisted(() => ({
  getSummaryWasteHierarchy: vi.fn(),
  getSummaryWasteHierarchyByProvince: vi.fn(),
  getSummaryWasteHierarchyByCity: vi.fn(),
  getWasteGroupByAdminHealthcareFacility: vi.fn(),
  getWasteGroupByTransporter: vi.fn(),
  getWasteGroupByTreatmentAll: vi.fn(),
  getWasteGroupDetailsByAction: vi.fn(),
  getWasteCharacteristicsSummary: vi.fn(),
  getSummaryPerDay: vi.fn(),
}));
vi.mock("./dashboard.repository", () => repoMock);

import * as service from "./dashboard.service";

describe("dashboard.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSummaryWasteHierarchy", () => {
    it("sanitizes pagination and returns the paginated result", async () => {
      repoMock.getSummaryWasteHierarchy.mockResolvedValue({ data: [{ provinceId: 1 }], total: 5 });

      const result = await service.getSummaryWasteHierarchy({});

      expect(repoMock.getSummaryWasteHierarchy).toHaveBeenCalledWith(10, 1, undefined, undefined);
      expect(result).toEqual({
        data: [{ provinceId: 1 }],
        pagination: { total: 5, pages: 1, currentPage: 1, perPage: 10 },
      });
    });
  });

  describe("getSummaryWasteHierarchyByProvince", () => {
    it("throws a plain Error (not APIError) when provinceId is missing", async () => {
      await expect(
        service.getSummaryWasteHierarchyByProvince({ provinceId: "" }),
      ).rejects.toThrow("provinceId are required.");
      try {
        await service.getSummaryWasteHierarchyByProvince({ provinceId: "" });
        expect.unreachable();
      } catch (err) {
        expect((err as { constructor: { name: string } }).constructor.name).not.toBe("APIError");
      }
    });

    it("delegates to the repository with the numeric provinceId", async () => {
      repoMock.getSummaryWasteHierarchyByProvince.mockResolvedValue({ data: [], total: 0 });
      await service.getSummaryWasteHierarchyByProvince({ provinceId: "3", limit: 5, page: 2 });
      expect(repoMock.getSummaryWasteHierarchyByProvince).toHaveBeenCalledWith(
        5,
        2,
        3,
        undefined,
        undefined,
      );
    });
  });

  describe("getSummaryWasteHierarchyByCity", () => {
    it("throws a plain Error when cityId is missing", async () => {
      await expect(service.getSummaryWasteHierarchyByCity({ cityId: "" })).rejects.toThrow(
        "cityId are required.",
      );
    });
  });

  describe("getWasteGroupByAdminHealthcareFacility", () => {
    it("overrides healthcareFacilityId with the caller's entity when they are a non-super-admin healthcare_facility", async () => {
      repoMock.getWasteGroupByAdminHealthcareFacility.mockResolvedValue({ data: [], total: 0 });

      await service.getWasteGroupByAdminHealthcareFacility({
        healthcareFacilityId: 999,
        callerEntityId: 42,
        callerEntityTypeName: "healthcare_facility",
        callerIsSuperAdmin: false,
      });

      expect(repoMock.getWasteGroupByAdminHealthcareFacility).toHaveBeenCalledWith(
        10,
        1,
        expect.objectContaining({ healthcareFacilityId: 42 }),
      );
    });

    it("does not override healthcareFacilityId for a super admin", async () => {
      repoMock.getWasteGroupByAdminHealthcareFacility.mockResolvedValue({ data: [], total: 0 });

      await service.getWasteGroupByAdminHealthcareFacility({
        healthcareFacilityId: 999,
        callerEntityId: 42,
        callerEntityTypeName: "healthcare_facility",
        callerIsSuperAdmin: true,
      });

      expect(repoMock.getWasteGroupByAdminHealthcareFacility).toHaveBeenCalledWith(
        10,
        1,
        expect.objectContaining({ healthcareFacilityId: 999 }),
      );
    });
  });

  describe("getWasteGroupByTreatment", () => {
    it("throws InvalidArgument (422-equivalent) when disposalTreatment is missing", async () => {
      await expect(
        service.getWasteGroupByTreatment({ callerEntityId: 1 }),
      ).rejects.toMatchObject({ code: ErrCode.InvalidArgument });
    });

    it("delegates to the repository once disposalTreatment is present", async () => {
      repoMock.getWasteGroupByTreatmentAll.mockResolvedValue({ data: [], total: 0 });
      await service.getWasteGroupByTreatment({
        disposalTreatment: "RECYCLER",
        callerEntityId: 7,
      });
      expect(repoMock.getWasteGroupByTreatmentAll).toHaveBeenCalledWith(
        10,
        1,
        7,
        "RECYCLER",
        expect.any(Object),
      );
    });
  });

  describe("getWasteGroupDetailsByAction", () => {
    it("throws a plain Error when wasteGroupId is missing", async () => {
      await expect(service.getWasteGroupDetailsByAction({ wasteGroupId: "" })).rejects.toThrow(
        "wasteGroupId are required.",
      );
    });

    it("defaults treatmentType to 'EX'", async () => {
      repoMock.getWasteGroupDetailsByAction.mockResolvedValue({ data: [], total: 0 });
      await service.getWasteGroupDetailsByAction({ wasteGroupId: "5" });
      expect(repoMock.getWasteGroupDetailsByAction).toHaveBeenCalledWith(10, 1, 5, "EX");
    });
  });

  describe("getWasteCharacteristicsSummary", () => {
    it("throws a plain Error when wasteTypeId is missing", async () => {
      await expect(
        service.getWasteCharacteristicsSummary({ startDate: "2024-01-01", endDate: "2024-01-31" }),
      ).rejects.toThrow("wasteTypeId are required.");
    });

    it("throws a plain Error when startDate/endDate are missing", async () => {
      await expect(
        service.getWasteCharacteristicsSummary({ wasteTypeId: 1 }),
      ).rejects.toThrow("startDate and endDate are required.");
    });

    it("returns the repository's rows wrapped in {data}", async () => {
      repoMock.getWasteCharacteristicsSummary.mockResolvedValue([
        { wasteGroupName: "A", totalWasteBag: 3, totalWeight: 10 },
      ]);
      const result = await service.getWasteCharacteristicsSummary({
        wasteTypeId: 1,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      expect(result).toEqual({ data: [{ wasteGroupName: "A", totalWasteBag: 3, totalWeight: 10 }] });
    });
  });

  describe("getSummaryPerDay", () => {
    it("delegates straight to the repository", async () => {
      const summary = {
        wasteBagOutResult: { totalBags: 1, totalWeight: "1 Kg" },
        wasteBagThisDay: { totalBags: 2, totalWeight: "2 Kg" },
      };
      repoMock.getSummaryPerDay.mockResolvedValue(summary);
      await expect(service.getSummaryPerDay(9)).resolves.toEqual(summary);
      expect(repoMock.getSummaryPerDay).toHaveBeenCalledWith(9);
    });
  });
});
